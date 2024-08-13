const { allow_admin_access } = require('../utils/admin');
const { Product, ProductImage, User } = require('../models/index');
const { bucket, storage, ref, deleteObject, deleteImage } = require('../services/firebase');


exports.addProduct = async (req, res) => {
    try {
        // allow_admin_access(req, res);

        const { name, price, description } = req.body;
        const files = req.files; // استخدام req.files للحصول على الملفات المتعددة
        console.log("Parsed form data:", { name, price, description });

        if (!name || !price || !description) {
            return res.status(400).json({ message: 'All fields are required: name, price, description', status: "failed" });
        }

        const checkname = await Product.findOne({ where: { product_name: name } });
        if (checkname) {
            return res.status(400).json({ message: 'This product already exists', status: "failed" });
        }

        // إنشاء المنتج أولاً
        const product = await Product.create({
            product_name: name,
            description: description,
            price: price
        });

        let images = [];
        console.log("Uploading files to Firebase");

        for (const file of files) {
            const blob = bucket.file(`images/${file.originalname}`); // تخزين الصورة داخل مجلد "images"
            const blobStream = blob.createWriteStream({
                resumable: false
            });

            await new Promise((resolve, reject) => {
                blobStream.on('error', (err) => {
                    console.log(err);
                    reject(err);
                });

                blobStream.on('finish', async () => {
                    const options = {
                        action: 'read',
                        expires: '03-09-2491' // حدد تاريخ انتهاء الرمز
                    };
                    try {
                        const signedUrls = await blob.getSignedUrl({
                            action: 'read',
                            expires: '03-17-2025' // تاريخ انتهاء صلاحية الرابط
                        });
                        const url = signedUrls[0]; // URL الموقّع 
                        console.log(url);
                        images.push({
                            product_id: product.product_id,
                            image_url: url,
                            image_name: blob.name
                        });
                    } catch (error) {
                        console.error('Error getting signed URL:', error);
                    }
                    resolve();
                });

                blobStream.end(file.buffer);
            });
        }

        // إضافة الصور إلى جدول ProductImage
        if (images.length > 0) {
            await ProductImage.bulkCreate(images);
        }

        console.log("Product created successfully with images");
        res.status(200).json({ message: 'Product created successfully with images', product });
    } catch (error) {
        console.error("Error handling product creation:", error);
        res.status(500).json({ message: 'An error occurred while handling the product creation', error: error.message });
    }
};

exports.deletedProduct = async (req, res) => {
    try {
        // allow_admin_access(req, res);

        // const token = req.headers.authorization?.split(' ')[1]; // استخراج التوكن من الهيدر

        // if (!token) {
        //     return res.status(401).json({ message: 'Authorization token is missing' });
        // }

        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: 'Product ID is missing' });
        }

        console.log(`Attempting to delete product with ID: ${_id}`);

        const product = await Product.findByPk(_id, { include: ProductImage });

        if (!product) {
            return res.status(404).json({
                status: "failed",
                message: "The product is unavailable."
            });
        }

        let deletionErrors = [];

        for (const image of product.ProductImages) {
            try {
                await deleteImage(image.image_name);
            } catch (error) {
                deletionErrors.push({ fileName: image.name, error: error.message });
            }
        }

        if (deletionErrors.length > 0) {
            return res.status(500).json({
                message: 'Failed to delete one or more images',
                errors: deletionErrors,
                status: "failed"
            });
        }

        await product.destroy();
        res.status(200).json({ message: "The product was successfully deleted", status: "success" });
    } catch (error) {
        console.error("Error handling product deletion:", error);
        res.status(500).json({ message: 'An error occurred while handling the product deletion', error: error.message });
    }
};


exports.editProduct = async (req, res) => {
    try {
        // allow_admin_access(req, res);

        const { name, price, description, _id } = req.body;

        const files = req.files; // استخدام req.files للحصول على الملفات المتعددة

        if (!_id) {
            return res.status(400).json({ message: 'Product ID is missing' });
        }

        // العثور على المنتج باستخدام معرفه الأساسي وجلب الصور المرتبطة به
        const product = await Product.findByPk(_id, { include: ProductImage });
        console.log(_id)
        if (!product) {
            return res.status(404).json({ message: 'No matching product found.' });
        }

        // إعداد تحديثات المنتج
        let updateData = {};
        if (name !== undefined) updateData.product_name = name;
        if (price !== undefined) updateData.price = price;
        if (description !== undefined) updateData.description = description;

        let deletionErrors = [];
        let newImages = [];

        if (files && files.length > 0) {
            // حذف الصور القديمة المرتبطة بالمنتج
            await Promise.all(product.ProductImages.map(async (image) => {
                try {
                    await deleteImage(image.image_name);
                    await image.destroy(); // حذف الصورة من قاعدة البيانات
                } catch (error) {
                    deletionErrors.push({ fileName: image.image_name, error: error.message });
                }
            }));

            // إضافة الصور الجديدة
            newImages = await Promise.all(files.map(async (file) => {
                const blob = bucket.file(`images/${file.originalname}`);
                const blobStream = blob.createWriteStream({ resumable: false });

                return new Promise((resolve, reject) => {
                    blobStream.on('error', (err) => {
                        reject(err);
                    });

                    blobStream.on('finish', async () => {
                        try {
                            const signedUrls = await blob.getSignedUrl({ action: 'read', expires: '03-17-2025' });
                            resolve({ name: blob.name, url: signedUrls[0] });
                        } catch (error) {
                            reject(error);
                        }
                    });

                    blobStream.end(file.buffer);
                });
            }));

            // إضافة الصور الجديدة إلى التحديثات
            updateData.ProductImages = newImages.map(image => ({
                name: image.name,
                url: image.url
            }));
        }

        if (deletionErrors.length > 0) {
            return res.status(500).json({
                message: 'Failed to delete one or more images',
                errors: deletionErrors,
                status: "failed"
            });
        }

        // تحديث المنتج في قاعدة البيانات
        await product.update(updateData);

        // إضافة الصور الجديدة إلى قاعدة البيانات
        if (newImages.length > 0) {
            await Promise.all(newImages.map(async (imageData) => {
                await ProductImage.create({
                    image_url: imageData.url,
                    product_id: product.product_id
                });
            }));
        }

        res.status(200).json({ message: 'Product updated successfully.' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product.' });
    }
};

exports.getListProduct = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: {
                model: ProductImage,
                attributes: ['image_id', 'image_url', 'image_name']
            }
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

exports.editUser = async (req, res) => {
    try {
        const { email, first_name, last_name, password, phone_number, user_id } = req.body;

        // التأكد من أن user_id موجود في الطلب
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // إنشاء كائن updateDoc مع الحقول غير المعرفة فقط
        const updateData = {};
        if (email) updateData.email = email;
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (password) updateData.password = password;
        if (phone_number) updateData.phone_number = phone_number;

        // التحقق من وجود أي بيانات لتحديثها
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No data provided to update." });
        }

        // تحديث المستخدم في قاعدة البيانات
        const [updatedRows] = await User.update(updateData, {
            where: { user_id: user_id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }

        res.status(200).json({ message: `${updatedRows} user(s) updated.` });

    } catch (error) {
        console.error(`Error updating user: ${error}`);
        res.status(500).json({ message: "There is a server error. Please see the developer." });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // allow_admin_access(req, res);

        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        const deletedRows = await User.destroy({
            where: {
                user_id: user_id
            }
        });

        if (deletedRows === 0) {
            console.log('No user found to delete.');
            res.status(404).json({ message: 'No user found to delete.' });

        } else {
            res.status(200).json({ message: `${deletedRows} user(s) deleted.` });

        }

    } catch (error) {
        console.error("Error handling user deletion:", error);
        res.status(500).json({ message: 'An error occurred while handling the user deletion', error: error.message });
    }
};

exports.getListUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        if (users.length > 0) { // تحقق إذا كانت المصفوفة تحتوي على مستخدمين
            return res.status(200).json({
                message: "All users have been returned",
                usersList: users
            });
        } else {
            return res.status(404).json({
                message: "No users found"
            });
        }
    } catch (error) {
        console.error("Server error:", error.message); // استخدام console.error مع طباعة رسالة الخطأ

        return res.status(500).json({
            message: "An error occurred on the server. Please contact the developer."
        });
    }
};



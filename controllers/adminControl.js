const { validate } = require('../middlewares/validate');
const { allow_admin_access } = require('../utils/admin');
const Product = require('../models/Product');
const { bucket, storage, ref, deleteObject, deleteImage } = require('../services/firebase');


exports.addProduct = async (req, res) => {
    try {
        const token = req.headers.authorization;
        allow_admin_access(token);

        const { name, price, description } = req.body;
        const files = req.files; // استخدام req.files للحصول على الملفات المتعددة
        console.log("Parsed form data:", { name, price, description });

        if (!name || !price || !description) {
            return res.status(400).json({ message: 'All fields are required: name, price, description', status: "failed" });
        }

        const checkname = await Product.findOne({ name });
        if (checkname) {
            return res.status(400).json({ message: 'This product already exists', status: "failed" });
        }

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
                            name: blob.name,
                            url: url
                        });
                    } catch (error) {
                        console.error('Error getting signed URL:', error);
                    }
                    resolve();
                });

                blobStream.end(file.buffer);
            });
        }

        const product = new Product({
            name,
            price: parseFloat(price),
            description,
            images: images
        });
        await product.save();

        console.log("Product created successfully");
        res.status(200).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error("Error handling product creation:", error);
        res.status(500).json({ message: 'An error occurred while handling the product creation', error: error.message });
    }
};



exports.deletedProduct = async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        const isAdmin = allow_admin_access(token);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: 'Product ID is missing' });
        }

        console.log(`Attempting to delete product with ID: ${_id}`);

        const product = await Product.findById(_id);

        if (!product) {
            return res.status(404).json({
                status: "failed",
                message: "The product is unavailable."
            });
        }

        let deletionErrors = [];

        for (const file of product.images) {
            try {
                await deleteImage(file.name);
            } catch (error) {
                deletionErrors.push({ fileName: file.name, error: error.message });
            }
        }

        if (deletionErrors.length > 0) {
            return res.status(500).json({
                message: 'Failed to delete one or more images',
                errors: deletionErrors,
                status: "failed"
            });
        }

        await Product.deleteOne({ _id });
        res.status(200).json({ message: "The product was successfully deleted", status: "success" });
    } catch (error) {
        console.error("Error handling product deletion:", error);
        res.status(500).json({ message: 'An error occurred while handling the product deletion', error: error.message });
    }
};

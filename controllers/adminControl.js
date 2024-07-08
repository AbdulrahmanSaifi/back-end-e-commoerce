const { validate } = require('../middlewares/validate');
const { allow_admin_access } = require('../utils/admin');
const Product = require('../models/Product');
const { bucket } = require('../services/firbase');

exports.addProduct = async (req, res) => {
    try {
        const token = req.headers.authorization;
        allow_admin_access(token)

        const { name, price, description } = req.body;
        const files = req.files; // تعديل هنا لاستخدام req.files للحصول على الملفات المتعددة
        console.log("Parsed form data:", { name, price, description });

        if (!name || !price || !description) {
            return res.status(400).json({ message: 'All fields are required: name, price, description', status: "failed" });
        }

        const checkname = await Product.findOne({ name });
        if (checkname) {
            return res.status(400).json({ message: 'This product already exists', status: "failed" });
        }

        let imageUrls = [];
        console.log("Uploading files to Firebase");

        for (const file of files) {
            const blob = bucket.file(file.originalname);
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

                    const [url] = await blob.getSignedUrl(options);
                    imageUrls.push(url);
                    resolve();
                });

                blobStream.end(file.buffer);
            });
        }

        const product = new Product({
            name,
            price: parseFloat(price),
            description,
            images: imageUrls
        });
        await product.save();

        console.log("Product created successfully");
        res.status(200).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error("Error handling product creation:", error);
        res.status(500).json({ message: 'An error occurred while handling the product creation', error: error.message });
    }
};

const { User, Admin } = require('../models/index');
const { generateToken, decryptionPassword, checkPassword, generateTokenAdmin } = require('../utils/utils');

exports.createUser = async (req, res) => {
    try {
        const { email, first_name, last_name, password, phone_number } = req.body;

        // التحقق من وجود البريد الإلكتروني
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        // التحقق من وجود رقم الهاتف
        const phoneExists = await User.findOne({ where: { phone_number } });
        if (phoneExists) {
            return res.status(400).json({ message: "Phone number is already in use" });
        }

        // إنشاء المستخدم الجديد
        const user = await User.create({
            first_name,
            last_name,
            password, // تأكد من تشفير كلمة المرور قبل حفظها
            phone_number,
            email
        });

        // إنشاء التوكن
        const token = generateToken(user.user_id);

        // إرجاع الاستجابة
        return res.status(201).json({
            status: "Success",
            data: [],
            message: "Thank you for registering with us. Your account has been successfully created.",
            token
        });

    } catch (error) {
        console.error("Server error:", error.message);
        return res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password. Please try again with the correct credentials.",
                data: [],
                status: "failed"
            });
        }

        const hash_Password = user.password;
        const check_Password = await decryptionPassword(password, hash_Password);

        if (!check_Password) {
            return res.status(401).json({
                message: "Invalid email or password. Please try again with the correct credentials.",
                data: [],
                status: "failed"
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "You have been logged in successfully",
            status: "success",
            data: { token, user }
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while logging in. Please try again later.",
            status: "error",
            data: [],
            error: error.message
        });
    }
};
exports.createAdmin = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const admin = new Admin({
            email,
            name,
            password,
        });
        const existingUser = await Admin.findOne({
            where: {
                email: email
            }
        })
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            })
        }
        await admin.save();
        const token = generateTokenAdmin(admin.admin_id, admin.role);
        res.status(200).json({
            status: "Success",
            data: {
                token: token,
            },
            message: "Thank you for registering with us. Your account has been successfully created.",

        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ where:{email:email} });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid email or password. Please try again with the correct credentials.",
                data: [],
                status: "failed"
            });
        }

        const hash_Password = admin.password;
        const check_Password = await decryptionPassword(password, hash_Password);

        if (!check_Password) {
            return res.status(401).json({
                message: "Invalid email or password. Please try again with the correct credentials.",
                data: [],
                status: "failed"
            });
        }
        const token = generateTokenAdmin(admin._id, admin.role);

        res.status(200).json({
            message: "You have been logged in successfully",
            status: "success",
            data: { token, admin }
        });

    } catch (error) {
        res.status(500).json({
            message: "An error occurred while logging in. Please try again later.",
            status: "error",
            data: [],
            error: error.message
        });
    }
}



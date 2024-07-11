const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const secretKeyAdmin = process.env.SECRETKEYADMIN;

const generateTokenAdmin = (adminID, role) => {
    const payload = { id: adminID, role };
    const options = { expiresIn: '24h' };
    const token = jwt.sign(payload, secretKeyAdmin, options);
    return token;
};

const allow_admin_access = async (req, res) => {
    try {   
        const token = req.headers.authorization

        console.log(token)

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, secretKeyAdmin);
        } catch (error) {
            console.error('Invalid token:', error.message);
            return res.status(403).json({ message: 'Unauthorized access', status: 'failed' });
        }

        // التحقق من صلاحيات المستخدم
        if (!decodedToken || decodedToken.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized access', status: 'failed' });
        }

        // البحث عن المستخدم في قاعدة البيانات
        const admin = await Admin.findOne({ _id: decodedToken.id });
        if (!admin) {
            return res.status(403).json({ message: 'Unauthorized access', status: 'failed' });
        }

        // الانتقال إلى الخطوة التالية إذا كان المستخدم مصرح له
    } catch (error) {
        console.error('Error in allow_admin_access middleware:', error);
        res.status(500).json({ message: 'Server error', status: 'failed' });
    }
};

module.exports = {
    generateTokenAdmin,
    allow_admin_access
};

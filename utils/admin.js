const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Admin = require('../models/admin')
const secretKeyAdmin = process.env.SECRETKEYADMIN
const salt = 10

const generateTokenAdmin = (adminID, role) => {
    const payload = { id: adminID, role };

    const options = { expiresIn: '24h' };

    const token = jwt.sign(payload, secretKeyAdmin, options);

    return token;
}
const verifyTokenAdmin = (token) => {
    try {
        const decode = jwt.verify(token, secretKeyAdmin);
        return decode;
    } catch (error) {
        console.error('Invalid token:', error.message);
        return null;
    }
}
const permissionsCheck = async (barber_token) => {
    try {
        const de_token = verifyTokenAdmin(barber_token);
        const id = de_token.id
        console.log(de_token)
        if (!de_token || de_token.role !== "Admin") {
            return false;
        }

        const admin = await Admin.findOne({ _id: id });
        if (!admin) {
            return false;
        }

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const allow_admin_access = async (token) => {
    // التحقق من صلاحيات المستخدم
    const isAdmin = await permissionsCheck(token);
    if (!isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access', status: "failed" });
    }
}


module.exports = {
    generateTokenAdmin,
    verifyTokenAdmin,
    permissionsCheck,
    allow_admin_access
};

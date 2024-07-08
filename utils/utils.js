const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const secretKeyUser = process.env.SECRETKEYUSER
const secretKeyAdmin = process.env.SECRETKEYADMIN
const salt = 10

const generateToken = (userID) => {
    const payload = { id: userID };

    const options = { expiresIn: '24h' };

    const token = jwt.sign(payload, secretKeyUser, options);

    return token;
}

const verifyTokenUser = (token) => {
    try {
        const decode = jwt.verify(token, secretKeyUser)
        return decode
    } catch (error) {
        console.error('Invalid token:', err.message);
        return null;
    }
}
const generateTokenAdmin = (adminID, role) => {
    const payload = { id: adminID, role };

    const options = { expiresIn: '24h' };

    const token = jwt.sign(payload, secretKeyAdmin, options);

    return token;
}
const verifyTokenAdmin = (token) => {
    try {
        const decode = jwt.verify(token, secretKeyAdmin)
        return decode
    } catch (error) {
        console.error('Invalid token:', err.message);
        return null;
    }
}

const encryptionPass = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const passwordhash = await bcrypt.hash(password, salt)
        return passwordhash
    } catch (error) {
        throw new Error('Error encrypting password'); // التعامل مع الخطأ في حال حدوثه
    }
}

const decryptionPassword = async (password, passwordHash) => {
    try {
        return await bcrypt.compare(password, passwordHash);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// const permissionsCheck = async (barbertoken) => {
//     try {
//         const

        
//     } catch (error) {
        
//     }

// }
module.exports = {
    generateToken,
    verifyTokenUser,
    encryptionPass,
    decryptionPassword,
    generateTokenAdmin,
    verifyTokenAdmin
};

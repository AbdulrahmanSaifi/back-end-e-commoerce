const mongoose = require('mongoose');
const { encryptionPass } = require('../utils/utils')

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        default: "Admin"
    }

})

adminSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const hashpassword = await encryptionPass(this.password)
            this.password = hashpassword
            next()

        } catch (error) {
            next(error)
        }
    } else {
        return next()
    }
})



const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin 
const mongoose = require('mongoose');
const { encryptionPass } = require('../utils/utils')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    familyName: {
        type: String,
        required: [true, "Email is family Name"]
    }
    ,
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
    phone: {
        type: Number,
        required: [true, 'Phone is required'],
        unique: true
    },
    Favorites: {
        type: Object,
        default: {}
    },
    role: {
        type: String,
        default: "User"
    }

})

userSchema.pre('save', async function (next) {
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



const User = mongoose.model('User', userSchema)

module.exports = User 
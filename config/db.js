const mongoose = require('mongoose'

)
const connectdb = async () => {
    try {
        mongoose.connect('mongodb+srv://mrgames7700:Y9kXeRt1Ue0O0qVl@cluster0.pts3xm2.mongodb.net/?retryWrites=true&w=majority&appName=DataBase');
        console.log('Connected to MongoDB');    
    } catch (error) {
        console.log('Error connecting MongoDB :', error.message)
    }
}

module.exports =  connectdb
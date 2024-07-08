var mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    Product: {
        type: String,
        ref:"Produts",
        required: true
    },
})

const favorite = mongoose.model('Favorite', favoriteSchema)

module.exports = favorite
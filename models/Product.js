var mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true

  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {  // تعديل هذا الحقل لقبول مصفوفة من عناوين URL
    type: [],
    required: true  // يمكنك تعيينها إلى false إذا كانت الصور اختيارية
  }
})

const Product = mongoose.model('Produts', productSchema)

module.exports = Product
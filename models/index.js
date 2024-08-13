const { sequelize } = require('../config/db');
const Product = require('./product');
const ProductImage = require('./productImage');
const User  = require('./user')
const Useraddress = require('./userAddress')
const Admin = require('./admin')
// تعريف العلاقات بين النماذج
Product.hasMany(ProductImage, { foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

// تصدير النماذج مع قاعدة البيانات
const db = {
  sequelize,
  Product,
  ProductImage,
  User,
  Useraddress,
  Admin
};

module.exports = db;

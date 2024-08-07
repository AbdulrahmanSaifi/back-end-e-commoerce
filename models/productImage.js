const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductImage = sequelize.define('ProductImage', {
  image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Products', // استخدام اسم الجدول بدلاً من النموذج مباشرة
      key: 'product_id'
    }
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_name:{
    type:DataTypes.STRING(50)
  }
});

module.exports = ProductImage;

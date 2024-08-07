const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');
const Product = require('./product');
const OrderStatus = require('./orderStatus');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'product_id'
    }
  },
  status_id: {
    type: DataTypes.INTEGER,
    references: {
      model: OrderStatus,
      key: 'status_id'
    }
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Order;

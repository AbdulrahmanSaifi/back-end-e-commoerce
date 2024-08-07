const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderStatus = sequelize.define('OrderStatus', {
  status_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status_description: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

module.exports = OrderStatus;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');

const UserAddress = sequelize.define('UserAddress', {
  address_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  },
  address_line1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address_line2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zip_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = UserAddress;

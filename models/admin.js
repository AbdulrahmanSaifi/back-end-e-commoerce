const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // استيراد الاتصال بقاعدة البيانات
const bcrypt = require('bcrypt');
const { encryptionPass } = require('../utils/utils');

const Admin = sequelize.define('Admin', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Email is required'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6],
        msg: 'Password must be at least 6 characters long'
      }
    }
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Admin',
  }
}, {
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        try {
          const hashedPassword = await encryptionPass(admin.password);
          admin.password = hashedPassword;
        } catch (error) {
          throw new Error('Error encrypting password');
        }
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        try {
          const hashedPassword = await encryptionPass(admin.password);
          admin.password = hashedPassword;
        } catch (error) {
          throw new Error('Error encrypting password');
        }
      }
    }
  }
});

module.exports = Admin;

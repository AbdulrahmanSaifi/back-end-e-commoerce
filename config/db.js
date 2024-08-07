const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', '123123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const syncModels = async () => {
    try {
      await sequelize.sync({ alter: true }); // استخدم `force: true` لإعادة إنشاء الجداول
      console.log('Database & tables created or updated!');
    } catch (error) {
      console.error('Error synchronizing the models:', error);
    }
  };
module.exports = { sequelize, connectDB,syncModels };

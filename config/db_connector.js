const connectDB = require("./mongo");
// const getSequelize = require("../models/index");

const connectDatabase = async () => {
  try {
    // Connect to MongoDB
    connectDB();
    console.log('MongoDB connected');
    // Connect to Postgres
    // getSequelize()
    // Sync the database (Create tables if not exists)
    // await sequelize.sync({ alter: true });
    // console.log('Postgres tables synchronized successfully');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;

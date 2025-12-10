const connectDB = require("./mongo");
const sequelize = require("./pg");

const connectDatabase = async () => {
  try {
    // Connect to MongoDB
    connectDB();
    // Connect to Postgres
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    // Sync the database (Create tables if not exists)
    // await sequelize.sync({ alter: true });
    // console.log('Postgres tables synchronized successfully');
  } catch (error) {
    console.error('Unable to connect to the postgres database:', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;

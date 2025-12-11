const { Sequelize } = require('sequelize');
const { development } = require('./config');

const dotenv = require('dotenv');
dotenv.config();

// Option 1: Passing parameters separately (other dialects)
// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT,
//       dialect: 'postgres',
//       logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     }
// );

// Option 2: Passing a connection URI
// const path = require('path');
// const fs = require('fs');

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT,
//       dialect: 'postgres',
//       dialectOptions: {
//         ssl: {
//           require: true,
//           rejectUnauthorized: false,
//         },
//       },
//       logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     }
// );


const sequelize = new Sequelize(development.url, {
  dialect: development.dialect,
  dialectOptions: development.dialectOptions,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});


// const sequelize = new Sequelize(process.env.POSTGRES_URL, {
//   dialect: "postgres",
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//       ca: process.env.PG_CA_CERT || undefined
//     }
//   }
// });

module.exports = sequelize;

const { Sequelize } = require("sequelize");
const { production, development } = require('../config/config');

// const dotenv = require("dotenv");
// dotenv.config();

let sequelize;

function getSequelize() {
  if (!sequelize) {
    sequelize = new Sequelize(development.url, {
      dialect: development.dialect,
      dialectOptions: development.dialectOptions,
    });
  }
  sequelize.authenticate();
  console.log("Postgres connection successful");
  return sequelize;
}

// // Option 1: Passing parameters separately (other dialects)
// // const path = require('path');
// // const fs = require('fs');

// // const sequelize = new Sequelize(
// //     process.env.DB_NAME,
// //     process.env.DB_USER,
// //     process.env.DB_PASSWORD,
// //     {
// //       host: process.env.DB_HOST,
// //       port: process.env.DB_PORT,
// //       dialect: 'postgres',
// //       dialectOptions: {
// //         ssl: {
// //           require: true,
// //           rejectUnauthorized: false,
// //         },
// //       },
// //       logging: process.env.NODE_ENV === 'development' ? console.log : false,
// //     }
// // );

// // Option 2: Passing a connection URI
// // const sequelize = new Sequelize(process.env.POSTGRES_URL, {
// //   dialect: "postgres",
// //   dialectOptions: {
// //     ssl: {
// //       require: true,
// //       rejectUnauthorized: false,
// //       ca: process.env.PG_CA_CERT || undefined
// //     }
// //   }
// // });
// const sequelize = new Sequelize(
//   process.env.NODE_ENV === 'production' ? production.url : development.url, 
//   {
//       dialect: process.env.NODE_ENV === 'production' ? production.dialect : development.dialect,
//       dialectOptions: process.env.NODE_ENV === 'production' ? production.dialectOptions : development.dialectOptions,
//       logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     }
// )

// module.exports = sequelize;

module.exports = getSequelize;
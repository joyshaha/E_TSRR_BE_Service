const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  production: {
    url: process.env.POSTGRES_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: process.env.PG_CA_CERT // Aiven SSL Cert
      }
    }
  },

  development: {
    url: process.env.POSTGRES_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

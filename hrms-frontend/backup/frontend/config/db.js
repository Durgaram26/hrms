const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_SERVER,
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: false
      },
    },
  }
);

module.exports = sequelize;
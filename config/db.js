const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.JAWSDB_URL) {
  sequelize = new Sequelize(process.env.JAWSDB_URL);
} else {
  sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    { dialect: "mysql", host: process.env.DB_HOST }
  );
}

sequelize.authenticate().then(() => {
  console.log("sucessfully connected to database");
});

module.exports = sequelize;

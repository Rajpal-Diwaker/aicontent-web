 global.config = require("../Utilities/config").config;
const Sequelize = require('sequelize');
module.exports =  new Sequelize('tpm','root', config.DB_URL.password, {
  host: config.DB_URL.host,
  dialect: 'mysql',
  operatorsAliases: 'false',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

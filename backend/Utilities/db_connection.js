var mysql = require('mysql')
var config = require("./config").config;

var connection = mysql.createConnection({
  host: 'localhost',
  user: config.DB_URL.user,
  password: config.DB_URL.password,
  database: config.DB_URL.database
})

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = {
    db: connection
}
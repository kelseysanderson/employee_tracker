const mysql = require('mysql');
const { rootPw } = require('./creds.js');


connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: rootPw,
  database: 'employee_tracking',
});

connection.connect((err) => {
  if (err) throw err;
});

module.exports = connection
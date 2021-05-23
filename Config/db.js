const mysql = require('mysql2');

const con = mysql.createConnection(
    { host: 'localhost', user: 'root', password: 'root', database: 'my_calendar' }
);


module.exports = con.promise();
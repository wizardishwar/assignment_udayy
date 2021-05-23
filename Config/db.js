const mysql = require('mysql2');

const con = mysql.createConnection(
"mysql://f9feern0wghywenw:am2fn399ewsm99zl@tvcpw8tpu4jvgnnq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/pg8mava7lsr7looe"
);


module.exports = con.promise();
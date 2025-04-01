const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'cloud-comp-1.ctuwgys0q06w.eu-west-2.rds.amazonaws.com',   // from RDS console
  user: 'admin',                                  // or whatever you set
  password: 'akEVV3qoyChKDDINbm0g',                   // you set this at creation
  database: 'cloud_computing'                                    // or whatever you named it
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to RDS MySQL database!');
});

module.exports = db;

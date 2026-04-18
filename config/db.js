const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 5,
  idleTimeout: 60000,
  queueLimit: 0,
  timezone: "+05:30",
  dateStrings: true,
});

module.exports = pool.promise();

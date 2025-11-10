import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config(); // Load biến môi trường từ .env

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "smartwasher",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: process.env.DB_PORT || 3306
});

console.log("✅ MySQL pool created (smartwasher)");
export default pool;

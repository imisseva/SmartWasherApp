import mysql from "mysql2/promise";

// Use a pool so getConnection() is available for transactions
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "smartwasher",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
console.log("✅ MySQL pool created (smartwasher)");

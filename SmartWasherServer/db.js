import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "smartwasher", // ⚠️ đúng tên trong phpMyAdmin
});

export default db;
console.log("✅ Kết nối MySQL thành công!");

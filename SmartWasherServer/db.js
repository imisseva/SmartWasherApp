// db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",         // ⚠️ thay bằng user MySQL của bạn
  password: "123456",         // ⚠️ nếu có mật khẩu thì điền vào
  database: "smartwasher",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
  } else {
    console.log("✅ Kết nối MySQL thành công");
  }
});

module.exports = db;

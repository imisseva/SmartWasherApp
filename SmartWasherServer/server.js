const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Kết nối MySQL
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "smartwasher",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
  } else {
    console.log("✅ Kết nối MySQL thành công!");
  }
});

// 🔹 API test server
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Server hoạt động bình thường 🚀" });
});

// 🔹 API đăng nhập
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.json({ success: false, message: "Thiếu thông tin" });

  const sql = "SELECT * FROM account WHERE username=? AND password=?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn:", err);
      return res.json({ success: false, message: "Lỗi server" });
    }

    if (results.length > 0) {
      console.log(`🔐 Người dùng ${username} đăng nhập thành công`);
      return res.json({ success: true, user: results[0] });
    } else {
      console.log(`❌ Sai tài khoản hoặc mật khẩu cho ${username}`);
      return res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
  });
});

// 🔹 Khởi động server
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server chạy tại http://192.168.1.81:5000");
});

// const express = require("express");
// const cors = require("cors");
// const mysql = require("mysql2");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // 🔹 Kết nối MySQL
// const db = mysql.createConnection({
//   host: "127.0.0.1",
//   user: "root",
//   password: "123456",
//   database: "smartwasher",
// });

// db.connect((err) => {
//   if (err) {
//     console.error("❌ Lỗi kết nối MySQL:", err);
//   } else {
//     console.log("✅ Kết nối MySQL thành công!");
//   }
// });

// // 🔹 API test server
// app.get("/api/test", (req, res) => {
//   res.json({ message: "✅ Server hoạt động bình thường 🚀" });
// });

// // 🔹 API đăng nhập
// app.post("/api/login", (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password)
//     return res.json({ success: false, message: "Thiếu thông tin" });

//   const sql = "SELECT * FROM account WHERE username=? AND password=?";
//   db.query(sql, [username, password], (err, results) => {
//     if (err) {
//       console.error("❌ Lỗi truy vấn:", err);
//       return res.json({ success: false, message: "Lỗi server" });
//     }

//     if (results.length > 0) {
//       console.log(`🔐 Người dùng ${username} đăng nhập thành công`);
//       return res.json({ success: true, user: results[0] });
//     } else {
//       console.log(`❌ Sai tài khoản hoặc mật khẩu cho ${username}`);
//       return res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
//     }
//   });
// });

// // === API LƯU LỊCH SỬ GIẶT ===
// app.post("/api/wash-history", (req, res) => {
//   const { user_id, washer_id, cost } = req.body;
//   if (!user_id || !washer_id)
//     return res.json({ success: false, message: "Thiếu thông tin" });

//   const sql = `
//     INSERT INTO wash_history (user_id, washer_id, cost)
//     VALUES (?, ?, ?)
//   `;
//   db.query(sql, [user_id, washer_id, cost || 0], (err, result) => {
//     if (err) {
//       console.error("❌ Lỗi lưu lịch sử:", err);
//       return res.json({ success: false, message: "Lỗi lưu dữ liệu" });
//     }
//     console.log(`✅ Lưu lịch sử giặt: user=${user_id}, máy=${washer_id}, tiền=${cost}`);
//     res.json({ success: true });
//   });
// });

// // === API ADMIN LẤY LỊCH SỬ GIẶT ===
// app.get("/api/admin/wash-history", (req, res) => {
//   const sql = `
//     SELECT wh.id, u.name AS user_name, w.name AS washer_name, wh.cost, wh.requested_at
//     FROM wash_history wh
//     JOIN user u ON wh.user_id = u.id
//     JOIN washer w ON wh.washer_id = w.id
//     ORDER BY wh.requested_at DESC
//   `;
//   db.query(sql, (err, results) => {
//     if (err) return res.json({ success: false, message: "Lỗi truy vấn" });
//     res.json({ success: true, data: results });
//   });
// });


// // 🔹 API lấy lịch sử giặt theo người dùng
// app.get("/api/history", (req, res) => {
//   // Lấy user_id từ query, ví dụ: /api/history?user_id=1
//   const userId = req.query.user_id;

//   if (!userId) {
//     return res.json({ success: false, message: "Thiếu user_id" });
//   }

//   const sql = `
//     SELECT w.id, washer.name AS machineName, w.requested_at AS date, 
//            w.cost, 'Hoàn thành' AS status
//     FROM wash_history w
//     JOIN washer ON w.washer_id = washer.id
//     WHERE w.user_id = ?
//     ORDER BY w.id DESC
//   `;

//   db.query(sql, [userId], (err, results) => {
//     if (err) {
//       console.error("❌ Lỗi MySQL:", err);
//       return res.json({ success: false, message: "Lỗi truy vấn CSDL" });
//     }
//     res.json(results);
//   });
// });



// app.get("/api/washer/:id", (req, res) => {
//   const id = req.params.id;
//   db.query("SELECT * FROM washer WHERE id = ?", [id], (err, results) => {
//     if (err) return res.json({ success: false, message: err.message });
//     if (results.length === 0) return res.json({ success: false, message: "Không tìm thấy máy" });
//     res.json({ success: true, washer: results[0] });
//   });
// });


// // 🔹 Khởi động server
// app.listen(5000, "0.0.0.0", () => {
//   console.log("🚀 Server chạy tại http://192.168.1.81:5000");
// });
import app from "./app.js";
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("API listening on", PORT));

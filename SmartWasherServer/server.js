// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const PORT = 8081; // ⚠️ bạn có thể đổi port nếu cần

app.use(cors());
app.use(bodyParser.json());

// 🌐 Kiểm tra server
app.get("/", (req, res) => {
  res.send("✅ SmartWasher Server is running!");
});


// =====================================================
// 🧾 API 1: Đăng nhập
// =====================================================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM account WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi truy vấn" });
    if (results.length === 0) return res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });

    const account = results[0];
    res.json({ success: true, account });
  });
});


// =====================================================
// 👤 API 2: Lấy thông tin người dùng theo ID account
// =====================================================
app.get("/api/user/:account_id", (req, res) => {
  const { account_id } = req.params;
  const sql = "SELECT * FROM user WHERE account_id = ?";
  db.query(sql, [account_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi truy vấn" });
    if (results.length === 0) return res.json({ success: false, message: "Không tìm thấy user" });
    res.json({ success: true, user: results[0] });
  });
});


// =====================================================
// 🧺 API 3: Bắt đầu giặt
// =====================================================
app.post("/api/start", (req, res) => {
  const { user_id, washer_id } = req.body;

  // Lấy thông tin user và máy giặt
  const getUser = "SELECT free_washes_left FROM user WHERE id = ?";
  const getWasher = "SELECT price FROM washer WHERE id = ?";

  db.query(getUser, [user_id], (err, userResult) => {
    if (err || userResult.length === 0) return res.json({ success: false, message: "Không tìm thấy user" });

    db.query(getWasher, [washer_id], (err, washerResult) => {
      if (err || washerResult.length === 0) return res.json({ success: false, message: "Không tìm thấy máy giặt" });

      const user = userResult[0];
      const washer = washerResult[0];
      let cost = 0;
      let free = 1;

      // Nếu còn lượt miễn phí
      if (user.free_washes_left > 0) {
        cost = 0;
        free = 1;
      } else {
        cost = washer.price;
        free = 0;
      }

      // Cập nhật lượt giặt còn lại và tổng số lần giặt
      const updateUser = `
        UPDATE user 
        SET free_washes_left = GREATEST(free_washes_left - 1, 0),
            total_washes = total_washes + 1
        WHERE id = ?
      `;
      db.query(updateUser, [user_id]);

      // Lưu vào lịch sử giặt
      const insertHistory = `
        INSERT INTO wash_history (user_id, washer_id, cost, free)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertHistory, [user_id, washer_id, cost, free], (err2) => {
        if (err2) return res.json({ success: false, message: "Lỗi ghi lịch sử giặt" });

        res.json({
          success: true,
          message: "Đã bắt đầu giặt",
          cost,
          free,
        });
      });
    });
  });
});


// =====================================================
// 💰 API 4: Lấy doanh thu tổng
// =====================================================
app.get("/api/revenue", (req, res) => {
  const sql = `
    SELECT 
      DATE(requested_at) AS date,
      SUM(cost) AS total_income,
      COUNT(*) AS total_washes
    FROM wash_history
    GROUP BY DATE(requested_at)
    ORDER BY date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi truy vấn" });
    res.json({ success: true, revenue: results });
  });
});


// =====================================================
// 🚀 Khởi động server
// =====================================================
app.listen(PORT, () => {
  console.log(`🌍 Server chạy ở cổng ${PORT}`);
});

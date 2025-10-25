import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import { HistoryController } from "./controllers/historyController.js";
import userRoutes from "./routes/userRoutes.js";
import washerRoutes from "./routes/washerRoutes.js";
import { register } from "./controllers/authController.js";
import userWasherRoutes from "./routes/userWasherRoutes.js";
import washerInfoRoutes from "./routes/washerInfoRoutes.js";
import * as cron from 'node-cron';
import { resetWeeklyFreeWashes } from "./models/User.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({
  origin: "*", // Cho phép tất cả origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ✅ Mount routes chuẩn
app.use("/api", authRoutes);
app.use("/api/wash-history", historyRoutes);  // Đổi URL để khớp với client
app.use("/api/admin/users", userRoutes);
app.use("/api/washers", washerRoutes); // ✅ chỉ giữ 1 route chính
app.use("/api/washer", userWasherRoutes);
app.use("/api/washers", washerInfoRoutes); // API mới để lấy thông tin máy giặt

app.get("/", (req, res) => {
  res.send("✅ SmartWasher API đang chạy");
});

// ===== Admin: trigger weekly reset (used by admin UI)
const verifyToken = (req, res, next) => {
  try {
    const h = req.headers.authorization || "";
    const [typ, token] = h.split(" ");
    if (typ !== "Bearer" || !token) return res.status(401).json({ message: "Missing token" });
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};

app.post('/api/test/reset-washes', verifyToken, requireAdmin, async (req, res) => {
  try {
    const defaultWashes = Number(req.body?.default ?? 7);
    const affected = await resetWeeklyFreeWashes(defaultWashes);
    res.json({ success: true, message: `Reset ${affected} users to ${defaultWashes} free washes` });
  } catch (err) {
    console.error('reset-washes error', err);
    res.status(500).json({ success: false, message: 'Failed to reset free washes' });
  }
});

// ✅ Compatibility: cũ
app.post("/api/wash-history", HistoryController.createWashHistory);
app.post("/api/register", register);

// Cron job chạy vào 00:00 mỗi thứ 2 (ngày thứ 1 trong tuần)
cron.schedule("0 0 * * 1", async () => {
  const now = new Date();
  console.log(`\n� Bắt đầu reset lượt giặt miễn phí - ${now.toLocaleString("vi-VN")}`);
  
  try {
    await resetWeeklyFreeWashes(7);
    console.log("✅ Hoàn tất reset lượt giặt miễn phí hàng tuần");
  } catch (err) {
    console.error("❌ Lỗi khi reset lượt giặt:", err);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh",  // Timezone Việt Nam
  scheduled: true,
  runOnInit: false              // Không chạy ngay khi khởi động server
});

export default app;

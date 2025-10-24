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

const app = express();
app.use(cors());
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

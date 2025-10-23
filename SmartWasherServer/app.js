import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import { HistoryController } from "./controllers/historyController.js";
import userRoutes from "./routes/userRoutes.js";
import washerRoutes from "./routes/washerRoutes.js";
import { register } from "./controllers/authController.js";
import userWasherRoutes from "./routes/userWasherRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount routes chuẩn
app.use("/api", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/washers", washerRoutes); // ✅ chỉ giữ 1 route chính
app.use("/api/washer", userWasherRoutes); 

app.get("/", (req, res) => {
  res.send("✅ SmartWasher API đang chạy");
});

// ✅ Compatibility: cũ
app.post("/api/wash-history", HistoryController.createWashHistory);
app.post("/api/register", register);

export default app;

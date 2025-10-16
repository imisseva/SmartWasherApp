import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
  res.send("✅ SmartWasher API đang chạy");
});

app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server chạy tại http://192.168.1.81:5000");
});

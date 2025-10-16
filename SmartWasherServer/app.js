import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount routes
app.use("/api", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin/users", userRoutes); 
app.get("/", (req, res) => {
  res.send("✅ SmartWasher API đang chạy");
});

export default app;


import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import { HistoryController } from "./controllers/historyController.js";
import userRoutes from "./routes/userRoutes.js";
import washerRoutes from "./routes/washerRoutes.js";
import { register } from "./controllers/authController.js";



const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount routes
app.use("/api", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin/users", userRoutes); 
app.use("/api/admin/washers", washerRoutes);
app.use("/api/washer", washerRoutes);

app.get("/", (req, res) => {
  res.send("✅ SmartWasher API đang chạy");
});

// Compatibility: client sometimes posts to /api/wash-history
app.post("/api/wash-history", HistoryController.createWashHistory);

// Compatibility: ensure POST /api/register works when running server.js directly
app.post("/api/register", register);


export default app;


// Compatibility: ensure POST /api/register works when running server.js



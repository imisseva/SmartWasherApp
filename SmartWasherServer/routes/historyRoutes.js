import express from "express";
import { HistoryController } from "../controllers/historyController.js";

const router = express.Router();

// ✅ Gọi endpoint chính xác: /api/history/:userId
// Lấy lịch sử giặt cuối cùng của một máy giặt (phải đặt trước route có param động)
router.get("/last/:washer_id", HistoryController.getLastWashHistory);

// Route này phải đặt sau các route cụ thể
router.get("/:userId", HistoryController.getUserHistory);

// POST /api/wash-history used by client to save a wash record
// We mount this route on the main app as a top-level path, so create a small compatibility route
router.post("/create", HistoryController.createWashHistory);

export default router;

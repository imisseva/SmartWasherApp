import express from "express";
import { HistoryController } from "../controllers/historyController.js";

const router = express.Router();

// ✅ Gọi endpoint chính xác: /api/history/:userId
router.get("/:userId", HistoryController.getUserHistory);

export default router;

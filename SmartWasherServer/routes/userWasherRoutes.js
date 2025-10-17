import { Router } from "express";
import { getWasherById, getAllWashers } from "../controllers/userWasherController.js";

const router = Router();

// ✅ Cho phép người dùng lấy danh sách tất cả máy giặt (nếu cần hiển thị list)
router.get("/", getAllWashers);

// ✅ Lấy thông tin chi tiết 1 máy giặt
router.get("/:id", getWasherById);

export default router;

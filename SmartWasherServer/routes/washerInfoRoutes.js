import { Router } from "express";
import { getWasherInfo } from "../controllers/washerInfoController.js";

const router = Router();

// Lấy thông tin cơ bản của máy giặt
router.get("/:id/info", getWasherInfo);

export default router;
// routes/washerRoutes.js
import { Router } from "express";
import {
  getWashers,
  postWasher,
  putWasher,
  deleteWasherCtrl,
  getWasherById,
  getWasherByName,
  startWasher,
  stopWasher,
  updateWasherStatus,
  getWasherCommand,
} from "../controllers/washerController.js";
import { receiveResultFromESP } from "../controllers/washerController.js";

const router = Router();

// ==== CRUD LIST/SEARCH ====
router.get("/", (req, res, next) => {
  if (req.query && req.query.name) return getWasherByName(req, res, next);
  return getWashers(req, res, next);
});
router.post("/", postWasher);
router.put("/:id", putWasher);

// Đảm bảo delete route được đặt ở đây, trước các route khác có :id
router.delete("/:id", deleteWasherCtrl);

// ==== ESP COMMAND ENDPOINTS ====
// NOTE: Đặt /command TRƯỚC "/:id" để không bị khớp nhầm ":id=command"
router.get("/command", getWasherCommand);        // ESP hỏi lệnh tổng quát
router.get("/:id/command", getWasherCommand);    // ESP hỏi lệnh theo id (nếu cần)

// Update status: chấp nhận id ở body hoặc URL
router.put("/update-status", updateWasherStatus);
router.put("/update-status/:id", updateWasherStatus);

// Start/Stop từ App
router.put("/:id/start", startWasher);
router.put("/:id/stop", stopWasher);

// Cuối cùng mới đặt GET /:id (tránh đè /command)
router.get("/:id", getWasherById);
router.post("/result", receiveResultFromESP);

export default router;






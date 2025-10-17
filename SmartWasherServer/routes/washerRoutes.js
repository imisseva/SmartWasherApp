// routes/washerRoutes.js
import { Router } from "express";
import { getWashers, postWasher, putWasher, deleteWasherCtrl } from "../controllers/washerController.js";

// Nếu cần bảo vệ admin bằng JWT, thêm verifyToken/requireAdmin giống userRoutes
const router = Router();

router.get("/", getWashers);          // GET /api/admin/washers
router.post("/", postWasher);         // POST /api/admin/washers
router.put("/:id", putWasher);        // PUT /api/admin/washers/:id
router.delete("/:id", deleteWasherCtrl); // DELETE /api/admin/washers/:id

export default router;

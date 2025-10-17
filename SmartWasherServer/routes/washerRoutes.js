// routes/washerRoutes.js
import { Router } from "express";
import { getWashers, postWasher, putWasher, deleteWasherCtrl, getWasherById } from "../controllers/washerController.js";



// Nếu cần bảo vệ admin bằng JWT, thêm verifyToken/requireAdmin giống userRoutes
const router = Router();

// If query param 'name' is present, delegate to getWasherByName to return one washer.
router.get("/", (req, res, next) => {
	if (req.query && req.query.name) return getWasherByName(req, res, next);
	return getWashers(req, res, next);
});          // GET /api/admin/washers or GET /api/washer?name=...
router.post("/", postWasher);         // POST /api/admin/washers
router.put("/:id", putWasher);        // PUT /api/admin/washers/:id
router.delete("/:id", deleteWasherCtrl); // DELETE /api/admin/washers/:id
router.get("/:id", getWasherById);  // GET /api/washer/:id


export default router;

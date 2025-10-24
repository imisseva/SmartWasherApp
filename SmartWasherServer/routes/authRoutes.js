import express from "express";
import { login, register } from "../controllers/authController.js";
import jwt from "jsonwebtoken";
import { getUserByAccountId } from "../models/User.js";

const router = express.Router();
router.post("/login", login);
router.post("/register", register);

// GET /api/auth/me - trả về thông tin user dựa trên token
router.get("/me", async (req, res) => {
	try {
		const h = req.headers.authorization || "";
		const [typ, token] = h.split(" ");
		if (typ !== "Bearer" || !token) return res.status(401).json({ success: false, message: "Missing token" });
		const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
		const accountId = payload?.id;
		if (!accountId) return res.status(401).json({ success: false, message: "Invalid token" });
		const user = await getUserByAccountId(accountId);
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		return res.json({ success: true, user });
	} catch (err) {
		return res.status(401).json({ success: false, message: "Invalid token" });
	}
});

export default router;

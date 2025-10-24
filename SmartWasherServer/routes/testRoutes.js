// routes/testRoutes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import { resetWeeklyFreeWashes } from "../scripts/run-reset.js";

const verifyToken = (req, res, next) => {
  try {
    const h = req.headers.authorization || "";
    const [typ, token] = h.split(" ");
    if (typ !== "Bearer" || !token) return res.status(401).json({ message: "Missing token" });
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};

const router = Router();

// Require admin authentication
router.use(verifyToken, requireAdmin);

// Reset all users' free washes
router.post("/reset-washes", async (req, res) => {
  try {
    const defaultWashes = req.body.default || 7;
    const result = await resetWeeklyFreeWashes(defaultWashes);
    res.json(result);
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi reset lượt giặt miễn phí",
      error: error.message,
    });
  }
});

export default router;
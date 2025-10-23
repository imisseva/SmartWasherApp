// routes/userRoutes.js
import { Router } from "express";
import { getUsers, postUser, putUser, deleteUser } from "../controllers/userController.js";


import jwt from "jsonwebtoken";
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
// bật nếu bạn đã phát token ở /api/login:
router.use(verifyToken, requireAdmin);

router.get("/", getUsers);
router.post("/", postUser);
router.put("/:id", putUser);
router.delete("/:id", deleteUser);

export default router;

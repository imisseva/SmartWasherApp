import express from "express";
import { login, register, me } from "../controllers/authController.js";

const router = express.Router();
router.post("/login", login);
router.post("/register", register);
router.get("/me", me);

export default router;

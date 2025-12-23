import express from "express";
import { login, refreshToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.get("/refresh", refreshToken);

export default router;

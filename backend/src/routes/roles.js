import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/roles",
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    authorize('SUPER_ADMIN'),
    (req, res) => {
        res.json({ data: "Beda role akses" });
    }
);

export default router;

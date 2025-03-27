import express from "express";
import { registerAdmin, loginAdmin, updateAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.put("/update", updateAdmin); // ✅ New updateAdmin route

export default router;

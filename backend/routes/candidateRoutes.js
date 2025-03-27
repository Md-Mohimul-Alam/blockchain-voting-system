import express from "express";
import { upload } from "../controllers/candidateController.js";
import { createCandidate, getAllCandidates, deleteCandidate, updateCandidate } from "../controllers/candidateController.js";

const router = express.Router();

router.post("/register", upload.single("logo"), createCandidate); // ✅ Upload Logo
router.get("/all", getAllCandidates);
router.delete("/delete/:did", deleteCandidate);
router.put("/update", upload.single("logo"), updateCandidate); // ✅ Upload Updated Logo

export default router;

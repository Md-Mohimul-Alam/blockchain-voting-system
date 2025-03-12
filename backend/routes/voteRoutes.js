import express from "express";
import {
  registerAdmin,
  registerUser,
  login,
  registerCandidate,
  listCandidates,
  updateCandidate,
  deleteCandidate,
  vote,
  closeVoting,
  resetElection,
} from "../controllers/voteController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerConfig.js"; 

const router = express.Router();

// ✅ Public Routes (No Auth Required)
router.post("/registerAdmin", registerAdmin);
router.post("/registerUser", registerUser);
router.post("/login", login);

// ✅ Candidate Management (Admin Only)
router.post("/registerCandidate", verifyToken, isAdmin, upload.single("logo"), registerCandidate);
router.put("/updateCandidate", verifyToken, isAdmin, updateCandidate);
router.delete("/deleteCandidate", verifyToken, isAdmin, deleteCandidate);
router.get("/listCandidates", verifyToken, listCandidates);

// ✅ Voting Routes (Protected)
router.post("/vote", verifyToken, vote);
router.post("/closeVoting", verifyToken, isAdmin, closeVoting);
router.post("/resetElection", verifyToken, isAdmin, resetElection);

export default router;

import express from "express";
import {
  registerAdmin,
  loginAdmin,
  updateAdmin,
  registerUser,
  loginUser,
  updatePersonalInfo,
  getPersonalInfo,
  createCandidate,
  getAllCandidates,
  deleteCandidate,
  declareWinner,
  closeElection,
  resetElection,
  castVote,
  seeWinner,
} from "../controllers/votingController.js"; // Update the path to your controller file
import { upload } from "../controllers/votingController.js"; // Import multer configuration if needed

const router = express.Router();

// Admin Routes
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.put("/admin/update", updateAdmin);

// User Routes
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.put("/user/update", updatePersonalInfo);
router.get("/user/:did", getPersonalInfo);

// Candidate Routes
router.post("/candidate/create", upload.single("logo"), createCandidate); // For logo upload
router.get("/candidates/all", getAllCandidates);
router.delete("/candidate/:did", deleteCandidate);

// Election Routes
router.post("/election/:electionID/winner", declareWinner);
router.post("/election/:electionID/close", closeElection);
router.post("/election/:electionID/reset", resetElection);

// Voting Routes
router.post("/vote", castVote);
router.get("/election/:electionID/winner", seeWinner);

export default router;

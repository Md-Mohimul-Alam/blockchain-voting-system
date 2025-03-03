// routes/voteRoutes.js
import express from "express";
import {
  registerCandidate,
  deleteCandidate,
  updateCandidate,
  vote,
  closeVoting,
  getResults,
  getCandidates,
  getVoterVote,
  resetElection,
  registerVoter,
  searchVoter,
  deleteVoter,
} from "../controllers/voteController.js";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
// Voting-related routes
router.post("/registerCandidate", registerCandidate);
router.post("/deleteCandidate", deleteCandidate);
router.post("/updateCandidate", updateCandidate);
router.post("/castVote", vote);
router.post("/closeVoting", closeVoting);
router.get("/getResults", getResults);
router.get("/getCandidates", getCandidates);
router.get("/getVoterVote/:voterDID", getVoterVote);
router.post("/resetElection", resetElection);

// Voter management routes
router.post("/registerVoter", registerVoter);
router.get("/searchVoter/:did", searchVoter);
router.delete("/deleteVoter", deleteVoter);

export default router;

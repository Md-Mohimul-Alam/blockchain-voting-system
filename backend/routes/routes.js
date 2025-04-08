import express from "express";
import {
  registerAdmin,
  loginAdmin,
  updateAdmin,
  registerUser,
  loginUser,
  updatePersonalInfo,
  updateCandidate,
  getPersonalInfo,
  createCandidate,
  getAllCandidates,
  deleteCandidate,
  declareWinner,
  closeElection,
  resetElection,
  castVote,
  seeWinner,
  getTotalCandidatesCount,
  createElection,
  getAllVoters,
  getTotalVotersCount,
  getTotalVoteCount,
  getAllCandidatesUsers
} from "../controllers/votingController.js";
import { upload } from "../controllers/votingController.js"; // Import multer configuration if needed
import authenticateAdmin from '../middlewares/authenticateAdmin.js';  // Import the authentication middleware for Admin
import authenticateUser from '../middlewares/authenticate.js';  // Generic authentication middleware for User

const router = express.Router();


// Admin Routes
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.put("/admin/update", authenticateAdmin, updateAdmin);

// User Routes
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.put("/user/update", authenticateUser, updatePersonalInfo); // Protect user update with authentication
router.get("/user/:did", authenticateUser, getPersonalInfo); // Protect user get info with authentication

// Candidate Routes (Admin only)
router.post("/candidate/create", authenticateAdmin, upload.single("logo"), createCandidate); // Protect create candidate route with authenticateAdmin middleware
router.put("/candidate/update", authenticateAdmin, upload.single("logo"), updateCandidate); 
router.get("/candidate/all", authenticateAdmin, getAllCandidates); // Protect view all candidates route with authenticateAdmin middleware
router.delete("/candidate/:did", authenticateAdmin, deleteCandidate); // Protect delete candidate route with authenticateAdmin middleware
router.get('/candidateUser/all',authenticateUser, getAllCandidatesUsers);
// Election Routes (Admin only)
router.post("/election/create", authenticateAdmin, createElection); // Protect create election route with authenticateAdmin middleware
router.post("/election/:electionID/winner", authenticateAdmin, declareWinner); // Protect declare winner route with authenticateAdmin middleware
router.put("/election/:electionID/close", authenticateAdmin, closeElection); // Protect close election route with authenticateAdmin middleware
router.put("/election/:electionID/reset", authenticateAdmin, resetElection); // Protect reset election route with authenticateAdmin middleware

// Voting Routes (User only)
router.post("/vote", authenticateUser, castVote); // Protect vote route with authenticate middleware
router.get("/election/:electionID/winner", authenticateUser, seeWinner); // Protect view winner route with authenticate middleware

// Additional Routes
router.get("/total-candidates", authenticateAdmin, getTotalCandidatesCount); // Ensure authenticate middleware is applied here
router.get("/voters", authenticateAdmin, getAllVoters); // Protect getAllVoters route with authenticateAdmin middleware
router.get("/total-voters", authenticateAdmin, getTotalVotersCount);  // New route for total voters count
router.get("/total-vote-count", authenticateAdmin, getTotalVoteCount);  // New route for total vote count

export default router;

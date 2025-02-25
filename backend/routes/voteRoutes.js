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
} from "../controllers/voteController.js"; // ✅ Import controllers properly

// Create a new router instance
const router = express.Router();
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

import { createVoterDIDController, issueVoterCredentialController, listDIDsController } from "../controllers/ariesController.js"; // ✅ Import Aries Controller

// Aries DID and Credential routes
router.post("/issueVoterCredential", issueVoterCredentialController); // ✅ Add Aries Voter Credential API
router.post("/createVoterDID", createVoterDIDController); // ✅ New Route for Voter DID
router.get("/listDIDs", listDIDsController);


export default router; // ✅ Use ES Module export

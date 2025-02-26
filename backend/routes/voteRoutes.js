import express from "express";
import {
  registerCandidate,
  vote,
  deleteCandidate,
  updateCandidate,
  closeVoting,
  getResults,
  getCandidates,
  getVoterVote,
  resetElection,
} from "../controllers/voteController.js";

import {
  createVoterDIDController,
  issueVoterCredentialController,
  listDIDsController,
} from "../controllers/ariesController.js";

const router = express.Router();

// Fabric chaincode endpoints
router.post("/registerCandidate", registerCandidate);
router.post("/castVote", vote);
router.post("/deleteCandidate", deleteCandidate);
router.post("/updateCandidate", updateCandidate);
router.post("/closeVoting", closeVoting);
router.get("/getResults", getResults);
router.get("/getCandidates", getCandidates);
router.get("/getVoterVote/:voterDID", getVoterVote);
router.post("/resetElection", resetElection);

// Aries endpoints
router.post("/createVoterDID", createVoterDIDController);
router.post("/issueVoterCredential", issueVoterCredentialController);
router.get("/listDIDs", listDIDsController);

export default router;

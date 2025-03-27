import express from "express";
import { createElection, closeElection, resetElection, declareWinner } from "../controllers/electionController.js";

const router = express.Router();

// Define routes for election actions
router.post("/create", createElection);
router.put("/close/:electionID", closeElection);
router.put("/reset/:electionID", resetElection);
router.get("/declare-winner/:electionID", declareWinner);

export default router;

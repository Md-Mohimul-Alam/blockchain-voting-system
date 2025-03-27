import express from "express";
import { registerUser, loginUser, castVote, seeWinner } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser); // ✅ Route for loginUser
router.post("/vote", castVote); // ✅ Route for castVote
router.get("/winner/:electionID", seeWinner); // ✅ Route for seeWinner

export default router;

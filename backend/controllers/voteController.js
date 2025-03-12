import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";
import { getContract } from "../config/fabricConfig.js";

dotenv.config();

/**
 * ✅ Register Admin (Only One Allowed)
 */
export const registerAdmin = async (req, res) => {
  try {
    const { did, username, password } = req.body;
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      return res.status(400).json({ success: false, error: "❌ Admin already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ did, userId: username, password: hashedPassword, role: "admin", district: "N/A" });
    await admin.save();

    const contract = await getContract();
    await contract.submitTransaction("registerAdmin", did, username, password);

    res.json({ success: true, message: `✅ Admin ${username} registered successfully.` });
  } catch (error) {
    console.error("❌ Admin Registration Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Register User
 */
export const registerUser = async (req, res) => {
  try {
    const { did, userId, district, password } = req.body;
    const existingUser = await User.findOne({ did });

    if (existingUser) {
      return res.status(400).json({ success: false, error: `❌ User with DID ${did} already exists.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ did, userId, district, password: hashedPassword, role: "voter", hasVoted: false });
    await user.save();

    const contract = await getContract();
    await contract.submitTransaction("registerUser", did, userId, district, password);

    res.json({ success: true, message: `✅ User ${userId} registered successfully.` });
  } catch (error) {
    console.error("❌ User Registration Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Login (Users & Admins)
 */
export const login = async (req, res) => {
  try {
    const { did, password } = req.body;
    const user = await User.findOne({ did });

    if (!user) {
      return res.status(401).json({ success: false, error: "❌ User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "❌ Incorrect password." });
    }

    const token = jwt.sign({ did, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Register Candidate (Admin Only)
 */
export const registerCandidate = async (req, res) => {
  try {
    // Extract required data from the request
    const { adminDID, candidateID, name, dob } = req.body;
    const logo = req.file ? req.file.filename : "";  // Assign logo filename or empty string if not provided

    // Validate required fields
    if (!candidateID || !name || !dob) {
      return res.status(400).json({ success: false, error: "❌ Missing required fields: candidateID, name, or dob." });
    }

    // Log the candidate details to check parameters before proceeding
    console.log("📡 Registering Candidate with data:", { adminDID, candidateID, name, dob, logo });

    // You can also save the candidate to your database here if needed (optional)

    // Get the contract for interaction
    const contract = await getContract();

    // Call the chaincode function to register the candidate
    await contract.submitTransaction("registerCandidate", adminDID, candidateID, name, dob, logo);

    // Send a success response
    res.json({ success: true, message: `✅ Candidate ${name} registered successfully.` });
  } catch (error) {
    // Handle and log any errors
    console.error("❌ Register Candidate Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ List All Candidates (Including DOB)
 */
export const listCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    console.error("❌ List Candidates Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Update Candidate Details (Admin Only)
 */
export const updateCandidate = async (req, res) => {
  try {
    const { candidateID, newName, newDOB, newLogo } = req.body;
    
    if (!candidateID) {
      return res.status(400).json({ success: false, error: "❌ Candidate ID is required." });
    }

    await Candidate.findOneAndUpdate({ candidateID }, { 
      name: newName, 
      dob: newDOB, 
      logo: newLogo 
    });

    res.json({ success: true, message: `✅ Candidate ${candidateID} updated successfully.` });
  } catch (error) {
    console.error("❌ Update Candidate Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Delete Candidate
 */
export const deleteCandidate = async (req, res) => {
  try {
    const { candidateID } = req.body;
    await Candidate.findOneAndDelete({ candidateID });

    res.json({ success: true, message: `✅ Candidate ${candidateID} deleted successfully.` });
  } catch (error) {
    console.error("❌ Delete Candidate Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Cast a Vote (Users Only)
 */
export const vote = async (req, res) => {
  try {
    const { voterDID, candidateID } = req.body;
    const voter = await User.findOne({ did: voterDID });

    if (voter.hasVoted) {
      return res.status(400).json({ success: false, error: "❌ You have already voted." });
    }

    await Candidate.findOneAndUpdate({ candidateID }, { $inc: { votes: 1 } });
    await User.findOneAndUpdate({ did: voterDID }, { hasVoted: true });

    res.json({ success: true, message: `✅ Vote cast successfully for ${candidateID}` });
  } catch (error) {
    console.error("❌ Vote Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Close Voting & Declare Winner
 */
export const closeVoting = async (req, res) => {
  try {
    const winner = await Candidate.find().sort({ votes: -1 }).limit(1);
    const election = await Election.findOne({ status: "open" });

    if (!election) {
      return res.status(400).json({ success: false, error: "❌ No active election found." });
    }

    election.status = "closed";
    election.endDate = new Date();
    election.winnerID = winner[0]?.candidateID || null;
    await election.save();

    res.json({ success: true, message: "✅ Election closed!", winner });
  } catch (error) {
    console.error("❌ Close Voting Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ✅ Reset Election (Deletes all Candidates & Votes but Keeps Admin)
 */
export const resetElection = async (req, res) => {
  try {
    await Election.deleteMany({});
    await Candidate.deleteMany({});
    await User.updateMany({ role: "voter" }, { hasVoted: false });

    res.json({ success: true, message: "✅ Election has been reset successfully!" });
  } catch (error) {
    console.error("❌ Reset Election Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

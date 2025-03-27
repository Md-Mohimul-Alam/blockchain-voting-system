import bcrypt from "bcryptjs";
import { getContract } from "../config/fabricConfig.js";
import User from "../models/userModel.js";
import Candidate from "../models/candidateModel.js";
import Election from "../models/electionModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the "uploads/" folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in `uploads/` folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// Register Admin
export const registerAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const contract = await getContract();
    await contract.submitTransaction("registerAdmin", did, userName, dob, hashedPassword);

    await User.create({ did, userName, dob, password: hashedPassword, role: "admin" });

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering admin" });
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("loginAdmin", did, userName, dob);

    const admin = JSON.parse(result.toString());
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Admin login successful" });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

// Update Admin Details
export const updateAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password

    const contract = await getContract();
    await contract.submitTransaction("updateAdmin", did, userName, dob, hashedPassword);

    // Update the admin details in MongoDB
    await User.findOneAndUpdate({ did }, { userName, dob, password: hashedPassword });

    res.status(200).json({ message: "Admin details updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating admin details" });
  }
};

// Register User
export const registerUser = async (req, res) => {
  const { did, name, dob, birthplace, userName, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const contract = await getContract();
    await contract.submitTransaction("registerUser", did, name, dob, birthplace, userName, hashedPassword);

    await User.create({ did, name, dob, birthplace, userName, password: hashedPassword, role: "user" });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
};

// User Login
export const loginUser = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("loginUser", did, userName, dob);

    const user = JSON.parse(result.toString());
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "User login successful", data: user });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

// Update Personal Info
export const updatePersonalInfo = async (req, res) => {
  const { did, name, dob, birthplace, userName, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const contract = await getContract();
    await contract.submitTransaction("updatePersonalInfo", did, name, dob, birthplace, userName, hashedPassword);

    // Update user details in MongoDB
    await User.findOneAndUpdate({ did }, { name, dob, birthplace, userName, password: hashedPassword });

    res.status(200).json({ message: "Personal info updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating personal info" });
  }
};

// Get Personal Info
export const getPersonalInfo = async (req, res) => {
  const { did } = req.params;
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("getPersonalInfo", did);
    res.status(200).json(JSON.parse(result.toString()));
  } catch (error) {
    res.status(500).json({ error: "Error fetching personal info" });
  }
};

// Create Candidate
export const createCandidate = async (req, res) => {
  const { did, name, dob, birthplace } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Candidate logo is required" });
    }

    const logoPath = `/uploads/${req.file.filename}`; // Store logo file path

    const contract = await getContract();
    await contract.submitTransaction("createCandidate", did, name, dob, logoPath, birthplace);

    // Save candidate details in MongoDB
    await Candidate.create({ did, name, dob, logo: logoPath, birthplace });

    res.status(201).json({ message: "Candidate registered successfully", logo: logoPath });
  } catch (error) {
    res.status(500).json({ error: "Error registering candidate" });
  }
};

// Get All Candidates
export const getAllCandidates = async (req, res) => {
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("getAllCandidates");

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No candidates found." });
    }

    const candidates = JSON.parse(result.toString());
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Error fetching candidates" });
  }
};

// Delete Candidate
export const deleteCandidate = async (req, res) => {
  const { did } = req.params;
  try {
    const contract = await getContract();
    const candidateExists = await Candidate.findOne({ did });

    if (!candidateExists) {
      return res.status(404).json({ error: `Candidate with DID ${did} does not exist` });
    }

    const logoPath = path.join(process.cwd(), candidateExists.logo);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath); // Remove the file
    }

    await contract.submitTransaction("deleteCandidate", did);
    await Candidate.findOneAndDelete({ did });

    res.status(200).json({ message: `Candidate with DID ${did} has been deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: "Error deleting candidate" });
  }
};

// Declare Winner
export const declareWinner = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();
    const result = await contract.submitTransaction("declareWinner", electionID);

    await Election.findOneAndUpdate(
      { electionID },
      { winner: result.toString() },
      { new: true }
    );

    res.status(200).json({ message: `Winner declared: ${result.toString()}` });
  } catch (error) {
    res.status(500).json({ error: "Error declaring winner" });
  }
};

// Close Election
export const closeElection = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();
    const electionExists = await Election.findOne({ electionID });

    if (!electionExists) {
      return res.status(404).json({ error: `Election with ID ${electionID} does not exist` });
    }

    await contract.submitTransaction("closeElection", electionID);
    const updatedElection = await Election.findOneAndUpdate(
      { electionID },
      { status: "closed" },
      { new: true }
    );

    res.status(200).json({ message: `Election ${electionID} has been closed successfully.`, election: updatedElection });
  } catch (error) {
    res.status(500).json({ error: "Error closing election" });
  }
};

// Reset Election
export const resetElection = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();
    const electionExists = await Election.findOne({ electionID });

    if (!electionExists) {
      return res.status(404).json({ error: `Election with ID ${electionID} does not exist` });
    }

    if (electionExists.winner) {
      return res.status(400).json({ error: "Election cannot be reset after a winner is declared." });
    }

    await contract.submitTransaction("resetElection", electionID);
    const updatedElection = await Election.findOneAndUpdate(
      { electionID },
      { status: "open" },
      { new: true }
    );

    res.status(200).json({ message: `Election ${electionID} has been reset successfully.`, election: updatedElection });
  } catch (error) {
    res.status(500).json({ error: "Error resetting election" });
  }
};

// Cast Vote
export const castVote = async (req, res) => {
  const { did, candidateDid, electionID } = req.body;
  try {
    const contract = await getContract();
    const electionResult = await contract.evaluateTransaction("seeWinner", electionID);
    const election = JSON.parse(electionResult.toString());

    if (election.status !== "open") {
      return res.status(400).json({ error: "Voting is not allowed. Election is closed." });
    }

    const userAsBytes = await contract.evaluateTransaction("getPersonalInfo", did);
    const user = JSON.parse(userAsBytes.toString());

    if (user.voted) {
      return res.status(400).json({ error: `User ${did} has already voted` });
    }

    await contract.submitTransaction("castVote", did, candidateDid, electionID);
    res.status(200).json({ message: `Vote cast successfully for candidate ${candidateDid}` });
  } catch (error) {
    res.status(500).json({ error: "Error casting vote" });
  }
};

// See Election Winner
export const seeWinner = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("seeWinner", electionID);

    res.status(200).json(JSON.parse(result.toString()));
  } catch (error) {
    res.status(500).json({ error: "Error retrieving election winner" });
  }
};

import bcrypt from "bcryptjs";
import { getContract } from "../config/fabricConfig.js";
import User from "../models/userModel.js";

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

// Update Personal Info
export const updatePersonalInfo = async (req, res) => {
  const { did, name, dob, birthplace, userName, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const contract = await getContract();
    await contract.submitTransaction("updatePersonalInfo", did, name, dob, birthplace, userName, hashedPassword);

    await User.findOneAndUpdate({ did }, { name, dob, birthplace, userName, password: hashedPassword });

    res.status(200).json({ message: "Personal info updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating personal info" });
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
// Cast Vote
export const castVote = async (req, res) => {
  const { did, candidateDid, electionID } = req.body;
  try {
    const contract = await getContract();

    // Check if election is open
    const electionResult = await contract.evaluateTransaction("seeWinner", electionID);
    const election = JSON.parse(electionResult.toString());

    if (election.status !== "open") {
      return res.status(400).json({ error: "Voting is not allowed. Election is closed." });
    }

    // Check if user has already voted
    const userAsBytes = await contract.evaluateTransaction("getPersonalInfo", did);
    const user = JSON.parse(userAsBytes.toString());

    if (user.voted) {
      return res.status(400).json({ error: `User ${did} has already voted` });
    }

    // Cast vote in Hyperledger Fabric
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

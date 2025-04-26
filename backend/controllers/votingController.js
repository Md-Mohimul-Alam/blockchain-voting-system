// controllers/votingController.js
import { getContract } from "../config/fabricConfig.js"; // Correct casingimport fs from "fs";
import path from "path";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";

// Helper for invoking chaincode
const invoke = async (res, fn, ...args) => {
  try {
    const contract = await getContract();
    const result = await contract.submitTransaction(fn, ...args);
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper for evaluating chaincode
const query = async (res, fn, ...args) => {
  try {
    const contract = await getContract();
    console.log(`📦 Calling ${fn} with args:`, args); // 👈 Add this
    const result = await contract.evaluateTransaction(fn, ...args);
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error("❌ QUERY ERROR:", err); // 👈 Add this
    res.status(500).json({ error: err.message });
  }
};


// Helper to extract image data as base64
const getImageBase64 = (file) => {
  if (!file) return "";
  const imagePath = path.join(process.cwd(), "uploads", file.filename);
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
};

// Middleware: Verify role from JWT
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ error: "Only Admin is allowed to perform this action." });
  }
  next();
};

// 🔐 User Management
export const registerUser = async (req, res) => {
  try {
    const { role, did, fullName, dob, birthplace, username, password } = req.body;
    const imageBase64 = getImageBase64(req.file);
    const contract = await getContract();
    const result = await contract.submitTransaction("registerUser", role, did, fullName, dob, birthplace, username, password, imageBase64);
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message || "Registration failed." });
  }
};


export const login = async (req, res) => {
  const { role, did, dob, username, password } = req.body;

  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("login", role, did, dob, username, password);
    const user = JSON.parse(result.toString());

    const token = jwt.sign(
      { did: user.did, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error("Login failed (controller):", error.message);
    res.status(401).json({ error: "Invalid credentials" });
  }
};

export const updateProfile = (req, res) => {
  const { role, did, fullName, birthplace } = req.body;
  const imageBase64 = getImageBase64(req.file);
  invoke(res, "updateProfile", role, did, fullName, birthplace, imageBase64);
};

export const getUserProfile = (req, res) => query(res, "getUserProfile", req.params.role, req.params.did);
export const listAllUsers = async (req, res) => {
  try {
    const contract = await getContract();
    // Call the chaincode function to list all users
    const result = await contract.evaluateTransaction("listAllUsers");
    const users = JSON.parse(result.toString()); // Parse result into JSON
    res.json(users); // Return the users data
  } catch (err) {
    console.error("Error fetching users:", err); // Log error for debugging
    res.status(500).json({ error: "Failed to fetch users" }); // Return error response
  }
};
export const changePassword = (req, res) => invoke(res, "changePassword", ...Object.values(req.body));
export const deleteUser = (req, res) => invoke(res, "deleteUser", req.params.role, req.params.did);
export const assignRole = (req, res) => invoke(res, "assignRole", ...Object.values(req.body));

// 🗳️ Election Management
export const createElection = async (req, res) => {
  console.log("User:", req.user); // This will log the user data from the decoded token

  const { electionId, title, description, startDate, endDate } = req.body;

  if (!electionId || !title || !description || !startDate || !endDate) {
    return res.status(400).json({ error: "All fields (electionId, title, description, startDate, endDate) are required." });
  }

  try {
    const contract = await getContract();
    const result = await contract.submitTransaction("createElection", electionId, title, description, startDate, endDate);
    const election = JSON.parse(result.toString());
    res.status(201).json({
      message: "Election created successfully",
      election,
    });
  } catch (err) {
    console.error("Error creating election:", err.message);
    res.status(500).json({
      error: `Failed to create election. ${err.message}`,
    });
  }
};
// controllers/votingController.js

export const updateElectionDetails = async (req, res) => {
  const electionId = req.params.electionId;
  const { title, description, startDate, endDate } = req.body;

  try {
    const updatedElection = await invoke('updateElectionDetails', electionId, title, description, startDate, endDate);
    res.status(200).json(updatedElection);
  } catch (err) {
    console.error("Error updating election:", err);
    res.status(500).json({ error: "Failed to update election", message: err.message });
  }
};


export const deleteElection = (req, res) => invoke(res, "deleteElection", req.params.electionId);

export const getAllElections = (_req, res) => query(res, "getAllElections");
export const filterUpcomingElections = (_req, res) => query(res, "filterUpcomingElections");
export const getCalendar = (_req, res) => query(res, "getCalendar");
export const viewElectionDetails = (req, res) => query(res, "viewElectionDetails", req.params.electionId);

export const addCandidateToElection = (req, res) => invoke(res, "addCandidateToElection", ...Object.values(req.body));
export const removeCandidateFromElection = (req, res) => invoke(res, "removeCandidateFromElection", ...Object.values(req.body));
export const declareWinner = (req, res) => invoke(res, "declareWinner", ...Object.values(req.body));
export const getElectionResults = (req, res) => query(res, "getElectionResults", req.params.electionId);
export const getElectionHistory = (req, res) => query(res, "getElectionHistory", req.params.electionId);
export const getElectionVoters = (req, res) => query(res, "getElectionVoters", req.params.electionId);
export const getElectionVoterCount = (req, res) => query(res, "getElectionVoterCount", req.params.electionId);
export const getElectionVoteCount = (req, res) => query(res, "getElectionVoteCount", req.params.electionId);
export const getElectionVoterHistory = (req, res) => query(res, "getElectionVoterHistory", req.params.electionId);
export const getElectionVoteHistory = (req, res) => query(res, "getElectionVoteHistory", req.params.electionId);
export const getElectionNotifications = (req, res) => query(res, "getElectionNotifications", req.params.electionId);

// 👤 Candidate Management
export const applyForCandidacy = async (req, res) => {
  const { electionId } = req.body;
  const candidateId = req.user?.did;  // This assumes req.user.did is available after successful authentication

  if (!candidateId || !electionId) {
    return res.status(400).json({ error: "Candidate ID and Election ID are required." });
  }

  try {
    console.log(`Candidate ID: ${candidateId}, Election ID: ${electionId}`);

    // Get contract instance to interact with Hyperledger Fabric
    const contract = await getContract();

    // Call the 'applyForCandidacy' function in the chaincode
    const response = await contract.submitTransaction('applyForCandidacy', candidateId, electionId);
    
    // Check for empty response and handle accordingly
    if (!response || response.toString().trim() === '') {
      throw new Error("Empty response from chaincode");
    }

    // Parse the response from the chaincode
    const applicationDetails = JSON.parse(response.toString());

    // Log the successful candidacy application
    console.log(`Successfully applied for candidacy in election ${electionId}`);

    // Respond with the application status
    res.status(200).json({ message: "Successfully applied for candidacy", applicationDetails });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error applying for candidacy:", error);

    // Return a more detailed error response
    res.status(500).json({ error: "Failed to apply for candidacy", message: error.message });
  }
};



export const approveCandidacy = (req, res) => invoke(res, "approveCandidacy", ...Object.values(req.body));
export const rejectCandidacy = (req, res) => invoke(res, "rejectCandidacy", ...Object.values(req.body));
export const withdrawCandidacy = (req, res) => invoke(res, "withdrawCandidacy", ...Object.values(req.body));
export const listCandidateApplications = (req, res) => query(res, "listCandidateApplications", req.params.electionId);
export const getApprovedCandidates = (req, res) => query(res, "getApprovedCandidates", req.params.electionId);
export const getCandidateProfile = (req, res) => query(res, "getCandidateProfile", req.params.did);
export const updateCandidateProfile = (req, res) => invoke(res, "updateCandidateProfile", ...Object.values(req.body));
export const deleteCandidate = (req, res) => invoke(res, "deleteCandidate", req.params.did);
export const listAllCandidates = (_req, res) => query(res, "listAllCandidates");
export const getCandidateVoteCount = (req, res) => query(res, "getCandidateVoteCount", req.params.did);
export const getCandidateHistory = (req, res) => query(res, "getCandidateHistory", req.params.did);
export const getCandidateNotifications = (req, res) => query(res, "getCandidateNotifications", req.params.did);

// 🗳️ Voting
export const castVote = (req, res) => invoke(res, "castVote", ...Object.values(req.body));
export const countVotes = (req, res) => query(res, "countVotes", req.params.electionId);
export const getVotingResult = (req, res) => query(res, "getVotingResult", req.params.electionId);
export const getVoteReceipt = (req, res) => query(res, "getVoteReceipt", req.params.electionId, req.params.voterDid);
export const hasVoted = (req, res) => query(res, "hasVoted", req.params.electionId, req.params.voterDid);
export const listVotedElections = (req, res) => query(res, "listVotedElections", req.params.voterDid);
export const listUnvotedElections = (req, res) => query(res, "listUnvotedElections", req.params.voterDid);
export const getTurnoutRate = (req, res) => query(res, "getTurnoutRate", req.params.electionId);
export const getVotingHistory = (req, res) => query(res, "getVotingHistory", req.params.voterDid);
export const getVoteHistory = (req, res) => query(res, "getVoteHistory", req.params.electionId);
export const getVoteNotifications = (req, res) => query(res, "getVoteNotifications", req.params.voterDid);
export const getVoteCount = (req, res) => query(res, "getVoteCount", req.params.electionId);
export const getVoterCount = (req, res) => query(res, "getVoterCount", req.params.electionId);

// 📣 Complaints
export const submitComplain = (req, res) => invoke(res, "submitComplain", ...Object.values(req.body));
export const replyToComplaint = (req, res) => invoke(res, "replyToComplaint", ...Object.values(req.body));
export const viewComplaints = (_req, res) => query(res, "viewComplaints");
export const listComplaintsByUser = (req, res) => query(res, "listComplaintsByUser", req.params.did);
export const deleteComplaint = (req, res) => invoke(res, "deleteComplaint", req.params.complaintId);

// 📊 Logs and Reports
export const viewAuditLogs = (_req, res) => query(res, "viewAuditLogs");
export const searchAuditLogsByUser = (req, res) => query(res, "searchAuditLogsByUser", req.params.did);
export const generateElectionReport = (req, res) => query(res, "generateElectionReport", req.params.electionId);
export const downloadAuditReport = (_req, res) => query(res, "downloadAuditReport");

// ⚠️ System (Protected)
export const resetSystem = (req, res) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  invoke(res, "resetSystem");
};

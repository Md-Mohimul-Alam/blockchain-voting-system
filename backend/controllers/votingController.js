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
    
    console.log(`🛠️ Invoking chaincode function: ${fn} with args:`, args);
    const txn = contract.createTransaction(fn);

    const resultBuffer = await txn.submit(...args);

    console.log(`✅ Chaincode function ${fn} executed successfully.`);

    const result = resultBuffer.toString();
    if (result) {
      try {
        res.json(JSON.parse(result));
      } catch (parseErr) {
        res.json({ message: result });
      }
    } else {
      res.json({ message: "Transaction committed successfully." });
    }
  } catch (err) {
    console.error(`❌ Error invoking chaincode function ${fn}:`, err);
    res.status(500).json({ error: err.message || "Chaincode invoke failed." });
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

// votingController.js
// controllers/votingController.js

export const updateElectionDetails = async (req, res) => {
  const electionId = req.params.electionId;
  const { title, description, startDate, endDate } = req.body;

  try {
    await invoke(res, "updateElectionDetails", electionId, title, description, startDate, endDate);
  } catch (err) {
    console.error("Error updating election:", err);
    res.status(500).json({ error: "Failed to update election", message: err.message });
  }
};
export const filterRunningElections = async (_req, res) => {
  try {
    const contract = await getContract();
    const result = await contract.submitTransaction("filterRunningElections");

    const elections = JSON.parse(result.toString());
    console.log("Running Elections fetched:", elections.length);

    res.json(elections);
  } catch (error) {
    console.error("Error fetching running elections:", error);
    res.status(500).json({ error: "Failed to fetch running elections", message: error.message });
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
  const { electionId, did } = req.body;

  if (!electionId || !did) {
    return res.status(400).json({ error: "Election ID and Candidate DID are required." });
  }

  try {
    console.log(`Applying for Candidacy - Election ID: ${electionId}, Candidate DID: ${did}`);

    const contract = await getContract();

    // 🛠 Directly submit without checking active (chaincode no longer blocks)
    const response = await contract.submitTransaction('applyForCandidacy', electionId, did);

    if (!response || response.toString().trim() === '') {
      throw new Error("Empty response from chaincode");
    }

    const applicationDetails = JSON.parse(response.toString());

    console.log(`Candidacy Application Successful for Election ${electionId}, DID ${did}`);

    res.status(200).json({
      message: "Successfully applied for candidacy",
      applicationDetails,
    });
  } catch (error) {
    console.error("Error applying for candidacy:", error);
    res.status(500).json({
      error: "Failed to apply for candidacy",
      message: error.message,
    });
  }
};




export const approveCandidacy = async (req, res) => {
  const { electionId, did } = req.body;

  if (!did || !electionId) {
    return res.status(400).json({ error: "Candidate DID and Election ID are required." });
  }

  try {
    const contract = await getContract();

    // 🛠 Correctly call approveCandidacy (electionId first, then did)
    const response = await contract.submitTransaction('approveCandidacy', electionId, did);

    if (!response || response.toString().trim() === '') {
      throw new Error("Empty response from chaincode");
    }

    const approvalDetails = JSON.parse(response.toString());

    res.status(200).json({ message: "Candidacy approved successfully", approvalDetails });
  } catch (error) {
    console.error("Error approving candidacy:", error);
    res.status(500).json({ error: "Failed to approve candidacy", message: error.message });
  }
};

export const rejectCandidacy = (req, res) => invoke(res, "rejectCandidacy", ...Object.values(req.body));
export const withdrawCandidacy = (req, res) => invoke(res, "withdrawCandidacy", ...Object.values(req.body));

export const listAllCandidateApplications = async (req, res) => {
  try {
    const contract = await getContract();
    const response = await contract.submitTransaction('listCandidateApplicationsAll'); // 🔥 Use submitTransaction, not evaluateTransaction
    const applications = JSON.parse(response.toString());
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error listing candidacy applications:", error);
    res.status(500).json({ error: "Failed to fetch candidacy applications", message: error.message });
  }
};

export const getApprovedCandidates = async (req, res) => {
  const { electionId } = req.params;
  try {
    const contract = await getContract();
    const electionBytes = await contract.evaluateTransaction("viewElectionDetails", electionId);
    const election = JSON.parse(electionBytes.toString());
    const candidateDIDs = election.candidates || [];

    // Fetch full profiles for each candidate
    const candidateProfiles = await Promise.all(
      candidateDIDs.map(async (did) => {
        try {
          const candidateData = await contract.evaluateTransaction("getCandidateProfile", did);
          return JSON.parse(candidateData.toString());
        } catch (error) {
          console.error(`Failed to fetch profile for candidate DID: ${did}`, error);
          return null; // skip if error
        }
      })
    );

    // Filter out failed fetches
    const validCandidates = candidateProfiles.filter(profile => profile !== null);

    res.status(200).json(validCandidates);
  } catch (error) {
    console.error("Error fetching approved candidates:", error);
    res.status(500).json({ error: "Failed to fetch approved candidates", message: error.message });
  }
};

export const getCandidateProfile = (req, res) => query(res, "getCandidateProfile", req.params.did);
export const updateCandidateProfile = (req, res) => invoke(res, "updateCandidateProfile", ...Object.values(req.body));
export const deleteCandidate = (req, res) => invoke(res, "deleteCandidate", req.params.did);
export const listAllCandidates = (_req, res) => query(res, "listAllCandidates");
export const getCandidateVoteCount = (req, res) => query(res, "getCandidateVoteCount", req.params.did);
export const getCandidateHistory = (req, res) => query(res, "getCandidateHistory", req.params.did);
export const getCandidateNotifications = (req, res) => query(res, "getCandidateNotifications", req.params.did);

// 🗳️ Voting
export const castVote = async (req, res) => {
  const { electionId, voterDid, candidateDid } = req.body;

  if (!electionId || !voterDid || !candidateDid) {
    return res.status(400).json({ error: "Missing electionId, voterDid, or candidateDid" });
  }

  try {
    const contract = await getContract(); // ✅ direct access
    const result = await contract.submitTransaction("castVote", electionId, voterDid, candidateDid);

    const vote = JSON.parse(result.toString()); // ✅ parse result

    console.log("Vote successfully casted:", vote);

    res.status(200).json({ message: "Vote casted successfully", vote }); // ✅ instant replay
  } catch (error) {
    console.error("Error casting vote (controller):", error);
    res.status(500).json({ error: error.message || "Failed to cast vote" });
  }
};

export const getTotalVotes = async (_req, res) => {
  try {
    const contract = await getContract();
    const iterator = await contract.evaluateTransaction('viewAuditLogs'); // Use logs or direct votes listing

    const allLogs = JSON.parse(iterator.toString());
    const totalVotes = allLogs.filter(log => log.action === "CAST_VOTE").length;

    res.json({ totalVotes });
  } catch (error) {
    console.error("Error counting votes:", error);
    res.status(500).json({ error: "Failed to count votes" });
  }
};
// controllers/votingController.js

export const getVotingResult = async (req, res) => {
  try {
    const contract = await getContract();

    const resultBytes = await contract.evaluateTransaction("getVotingResult", req.params.electionId);
    const result = JSON.parse(resultBytes.toString());

    if (!result || !result.winner) {
      return res.status(404).json({ error: "Winner not found" });
    }
    
    let winnerData = result.winner;

    // 🛠 Only fetch full candidate profile if winner has minimal information
    if (!winnerData.fullName || winnerData.fullName === "Unknown Candidate") {
      const winnerProfileBytes = await contract.evaluateTransaction("getCandidateProfile", winnerData.did);
      const winnerProfile = JSON.parse(winnerProfileBytes.toString());

      winnerData = {
        did: winnerProfile.did,
        fullName: winnerProfile.fullName,
        username: winnerProfile.username,
        image: winnerProfile.image || "",
      };
    }

    res.json({
      winner: winnerData,
      maxVotes: result.maxVotes,
      totalCandidates: result.totalCandidates,
      totalVotes: result.totalVotes,
    });

  } catch (error) {
    console.error("Error fetching voting result:", error);
    res.status(500).json({ error: error.message || "Failed to fetch voting result" });
  }
};

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

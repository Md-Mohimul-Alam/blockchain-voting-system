import bcrypt from "bcryptjs";
import { getContract } from "../config/fabricConfig.js";
import User from "../models/userModel.js";
import Candidate from "../models/candidateModel.js";
import Election from "../models/electionModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

// Ensure the "uploads/" folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log(`Saving file: ${file.originalname}`);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// Middleware for verifying JWT token and extracting user details
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);  // Ensure JWT_SECRET_KEY is set in environment variables
    req.user = decoded;  // Store user details in the request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin Routes

// Register Admin
export const registerAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const contract = await getContract();

    // Register the admin in Hyperledger Fabric
    await contract.submitTransaction("registerAdmin", did, userName, dob, hashedPassword);

    // Optionally, store the admin in your local DB (MongoDB, for example)
    await User.create({ did, userName, dob, password: hashedPassword, role: "admin" });

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ error: error.message || "Error registering admin" });
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const contract = await getContract();
    
    // Call the loginAdmin function from the chaincode
    const result = await contract.evaluateTransaction("loginAdmin", did, userName, dob);
    const admin = JSON.parse(result.toString());
    
    // Compare the password using bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ did: admin.did, role: "admin" }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Send response with token, did, and role
    res.status(200).json({
      message: "Admin login successful",
      token,
      did: admin.did,  // Include did in the response
      role: "admin",   // Send the role as admin
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: error.message || "Error logging in" });
  }
};

// Admin Update
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

// User Routes

// Register User
export const registerUser = async (req, res) => {
  const { did, name, dob, birthplace, userName, password } = req.body;
  try {
    // Hash password before storing it in the blockchain
    const hashedPassword = await bcrypt.hash(password, 10);
    const contract = await getContract();

    // Store data on the blockchain using the chaincode function registerUser
    await contract.submitTransaction(
      "registerUser", 
      did, 
      name, 
      dob, 
      birthplace, 
      userName, 
      hashedPassword
    );

    // Store the user in the database (if needed, for indexing or other purposes)
    await User.create({
      did,
      name,
      dob,
      birthplace,
      userName,
      password: hashedPassword,
      role: "user",
    });

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

    // Generate JWT token
    const token = jwt.sign({ did: user.did, role: "user" }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Send response with token, did, and role
    res.status(200).json({
      message: "User login successful",
      token,
      did: user.did,  // Include did in the response
      role: "user",   // Send the role as user
    });
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
// Example for better error handling
export const getPersonalInfo = async (req, res) => {
  const { did } = req.params;

  if (!did || did.startsWith('total-')) {
    return res.status(400).json({ error: `Invalid DID: ${did}. Cannot retrieve personal info for aggregate values.` });
  }

  try {
    const contract = await getContract(); 
    const result = await contract.evaluateTransaction("getPersonalInfo", did);
    
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = JSON.parse(result.toString());
    res.status(200).json(userData); 
  } catch (error) {
    res.status(500).json({ error: "Error fetching personal info" });
  }
};

const generateUniqueID = () => {
  return `C${Date.now()}`; // Generating a unique ID based on the current timestamp (you can customize this logic)
};

// Create Candidate Controller (Admin only)
export const createCandidate = async (req, res) => {
  const { did, name, dob, birthplace } = req.body;  // Take 4 parameters from req.body
  const logo = req.file;  // Take the logo file from the request

  // Validate if the required fields are provided
  if (!did || !name || !dob || !birthplace || !logo) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if the did is not null or empty
  if (!did.trim()) {
    return res.status(400).json({ error: "The DID cannot be null or empty" });
  }

  const adminDID = req.user.did; // Get admin's DID from JWT token

  try {
    // Generate a unique candidateID
    const candidateID = generateUniqueID(); 

    // Create the candidate object with the unique candidateID
    const candidate = {
      candidateID,  // Assign the generated unique ID
      did,
      name,
      dob,
      logo: logo.filename, // Candidate Logo (just passing the filename)
      birthplace,
      role: "candidate",
      votes: 0,
    };

    // Get the contract to interact with the blockchain
    const contract = await getContract();

    // Submit the transaction to create the candidate on Hyperledger Fabric
    const result = await contract.submitTransaction(
      "createCandidate",  // Chaincode function name
      adminDID,  // Admin DID
      did,       // Candidate DID
      name,      // Candidate Name
      dob,       // Candidate Date of Birth
      logo.filename, // Candidate Logo (just passing the filename)
      birthplace // Candidate Birthplace
    );

    // Save the candidate in MongoDB
    await Candidate.create(candidate);  // Insert the candidate into MongoDB

    res.status(201).json({ message: "Candidate created successfully", candidate });
  } catch (error) {
    console.error("Error creating candidate:", error);
    res.status(500).json({ error: "Error creating candidate" });
  }
};

// Update Candidate (Admin only)
// In your votingController.js
export const updateCandidate = async (req, res) => {
  const { did, name, dob, logo, birthplace } = req.body;
  const adminDID = req.user.did; // Get admin's DID from JWT token

  try {
    const contract = await getContract();
    const result = await contract.submitTransaction("updateCandidate", adminDID, did, name, dob, logo, birthplace);

    // Check if the result returned is valid and parse it
    const updatedCandidate = JSON.parse(result.toString());
    await Candidate.findOneAndUpdate({ did: updatedCandidate.did }, updatedCandidate, { new: true });

    res.status(200).json({ message: "Candidate updated successfully", updatedCandidate });
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ error: "Error updating candidate" });
  }
};

// Delete Candidate (Admin only)
// Backend: Controller to delete candidate
export const deleteCandidate = async (req, res) => {
  const { did } = req.params;  // The candidate DID (c2) to delete
  const adminDID = req.user.did; // The admin's DID from the JWT token

  try {
    const contract = await getContract();
    
    // Pass the admin's DID and candidate's DID to delete
    const result = await contract.submitTransaction("deleteCandidate", adminDID, did);

    console.log("Delete candidate result:", result.toString());  // Log for debugging

    // If successful, delete from MongoDB
    await Candidate.findOneAndDelete({ did });

    res.status(200).json({ message: `Candidate with DID ${did} deleted successfully` });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ error: error.message || "Error deleting candidate" });
  }
};

// Get All Candidates
export const getAllCandidates = async (req, res) => {
  try {
    const contract = await getContract();
    // Ensure we're passing the admin DID correctly
    const result = await contract.evaluateTransaction("getAllCandidates", req.user.did);

    const candidates = JSON.parse(result.toString());
    
    // Ensure the logoUrl is set correctly
    const updatedCandidates = candidates.map(candidate => ({
      ...candidate,
      logoUrl: `/uploads/${candidate.logo}`, // Assuming logo is saved in 'uploads' folder
    }));

    res.status(200).json(updatedCandidates);  // Send updated candidates with logoUrl
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Error fetching candidates" });
  }
};

// Assuming you have authenticateUser middleware already in place
export const getAllCandidatesUsers = async (req, res) => {
  try {
    const did = req.headers["authorization"]?.split(" ")[1];  // Retrieve DID from Authorization header

    if (!did) {
      return res.status(403).json({ error: "User is not authenticated." });
    }

    const contract = await getContract();
    const result = await contract.evaluateTransaction("getAllCandidatesUsers", did);  // Pass DID directly

    const candidates = JSON.parse(result.toString());

    // Add logo URL to each candidate (if applicable)
    const updatedCandidates = candidates.map(candidate => ({
      ...candidate,
      logoUrl: `/uploads/${candidate.logo}`, // Assuming logo is saved in 'uploads' folder
    }));

    res.status(200).json(updatedCandidates);  // Send updated candidates with logoUrl
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Error fetching candidates" });
  }
};

// Election Routes (Admin only)
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

// Cast vote
export const castVote = async (req, res) => {
  const { did, candidateDid, electionID } = req.body;

  console.log('Authenticated user DID:', did);  // Log user DID for debugging
  console.log('Candidate DID:', candidateDid);  // Log candidate DID for debugging

  try {
    // Step 1: Validate election status
    const contract = await getContract();
    const electionResult = await contract.evaluateTransaction("seeWinner", electionID);
    const election = JSON.parse(electionResult.toString());

    if (election.status !== "open") {
      return res.status(400).json({ error: "Voting is not allowed. Election is closed." });
    }

    // Step 2: Check if the user has already voted using the user's DID
    const userAsBytes = await contract.evaluateTransaction("getPersonalInfo", did);  // Use the user's DID here
    const currentUser  = JSON.parse(userAsBytes.toString());

    if (currentUser .voted) {
      return res.status(400).json({ error: `User  with DID ${did} has already voted` });
    }

    // Step 3: Fetch candidate details using the candidate's DID
    const candidateAsBytes = await contract.evaluateTransaction("getAllCandidatesUsers", candidateDid);  // Use the candidate's DID here
    const candidate = JSON.parse(candidateAsBytes.toString());

    if (!candidate) {
      return res.status(400).json({ error: `Candidate with DID ${candidateDid} does not exist` });
    }

    // Step 4: Increment candidate's vote count
    candidate.votes += 1;

    // Step 5: Mark the user as having voted
    currentUser .voted = true;

    // Step 6: Submit the transaction to cast the vote
    await contract.submitTransaction("castVote", did, candidateDid, electionID);  // Ensure correct order of arguments here

    // Update user and candidate states on the ledger
    await contract.submitTransaction("updatePersonalInfo", did, currentUser .name, currentUser .dob, currentUser .birthplace, currentUser .userName, currentUser .password);
    await contract.submitTransaction("updateCandidateVotes", candidateDid, candidate.votes); // Assuming you have a function to update candidate votes

    res.status(200).json({ message: `Vote cast successfully for candidate ${candidateDid}` });
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({ error: "Error casting vote" });
  }
};

export const updateCandidateInfo = async (req, res) => {
  const { did, name, dob, logo, birthplace } = req.body;

  try {
      const contract = await getContract();
      const updatedCandidate = await contract.submitTransaction("updateCandidate", did, name, dob, logo, birthplace);
      res.status(200).json({ message: "Candidate updated successfully", candidate: JSON.parse(updatedCandidate.toString()) });
  } catch (error) {
      console.error("Error updating candidate:", error);
      res.status(500).json({ error: "Error updating candidate" });
  }
};


// Create Election (Admin only)
export const createElection = async (req, res) => {
  const { electionID, status, startDate } = req.body; // Data sent from the client

  try {
    const contract = await getContract();

    // Check if the election already exists
    const electionExists = await Election.findOne({ electionID });
    if (electionExists) {
      return res.status(400).json({ error: `Election with ID ${electionID} already exists` });
    }

    // Call the chaincode function to create the election on the blockchain
    const result = await contract.submitTransaction("createElection", electionID, status, startDate);

    // Save the election data in MongoDB (optional)
    const election = JSON.parse(result.toString()); // Assuming chaincode returns the election data
    await Election.create(election);

    res.status(201).json({ message: `Election ${electionID} created successfully`, election });
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ error: "Error creating election" });
  }
};

// Close Election (Admin only)
export const closeElection = async (req, res) => {
  const { electionID } = req.params;

  try {
    const contract = await getContract();

    // Check if the election exists in the database
    const electionExists = await Election.findOne({ electionID });
    if (!electionExists) {
      return res.status(404).json({ error: `Election with ID ${electionID} does not exist` });
    }

    // Call the chaincode function to close the election on the blockchain
    await contract.submitTransaction("closeElection", electionID);

    // Update the election status in MongoDB
    const updatedElection = await Election.findOneAndUpdate(
      { electionID },
      { status: "closed" },
      { new: true }
    );

    res.status(200).json({ message: `Election ${electionID} has been closed successfully.`, election: updatedElection });
  } catch (error) {
    console.error("Error closing election:", error);
    res.status(500).json({ error: "Error closing election" });
  }
};
// Reset Election (Admin only)
export const resetElection = async (req, res) => {
  const { electionID } = req.params;

  try {
    const contract = await getContract();

    // Check if the election exists in the database
    const electionExists = await Election.findOne({ electionID });
    if (!electionExists) {
      return res.status(404).json({ error: `Election with ID ${electionID} does not exist` });
    }

    // Ensure election is not closed or has a winner
    if (electionExists.winner) {
      return res.status(400).json({ error: "Election cannot be reset after a winner is declared." });
    }

    // Call the chaincode function to reset the election status on the blockchain
    // This will also delete the election from Hyperledger
    await contract.submitTransaction("resetElection", electionID);

    // Optionally, delete the election from the database (if you are storing it in MongoDB)
    await Election.findOneAndDelete({ electionID });

    res.status(200).json({ message: `Election ${electionID} has been reset and deleted successfully.` });
  } catch (error) {
    console.error("Error resetting election:", error);
    res.status(500).json({ error: "Error resetting election" });
  }
};


// Controller function for viewing election winner
export const seeWinner = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("seeWinner", electionID);

    res.status(200).json(JSON.parse(result.toString()));  // Return winner data
  } catch (error) {
    res.status(500).json({ error: "Error retrieving election winner" });
  }
};

// Get All Voters (Admin only)
// Get All Voters (Admin only)
export const getAllVoters = async (req, res) => {
  try {
    const contract = await getContract();
    
    // Call the chaincode function to get all voters
    const result = await contract.evaluateTransaction("getAllVoters");

    // Parse the result and return it in the response
    const voters = JSON.parse(result.toString());

    res.status(200).json({ voters });
  } catch (error) {
    console.error("Error getting all voters:", error);
    res.status(500).json({ error: "Error fetching voters" });
  }
};




export const getTotalCandidatesCount = async (req, res) => {
  try {
    console.log("Request user:", req.user);  // Log the request's user to see if `did` is set properly

    if (!req.user || !req.user.did) {
      return res.status(400).json({ error: "User DID is missing in the request" });
    }

    const contract = await getContract();  // Initialize the Hyperledger contract
    const result = await contract.evaluateTransaction("getAllCandidates", req.user.did); // Retrieve all candidates from blockchain
    
    const candidates = JSON.parse(result.toString());
    const totalCount = candidates.length;  // Get the total number of candidates
    
    // Return the total count
    res.status(200).json({ totalCandidates: totalCount });
  } catch (error) {
    console.error("Error fetching total candidate count:", error);
    res.status(500).json({ error: "Error fetching total candidate count" });
  }
};


export const getTotalVotersCount = async (req, res) => {
  const adminDID = req.user.did; // Make sure the DID is correctly parsed from the token or request
  if (!adminDID) {
    return res.status(400).json({ error: "User DID is missing in the request" });
  }

  try {
    const contract = await getContract();  // Initialize the Hyperledger contract
    const result = await contract.evaluateTransaction("getAllVoters", adminDID); // Retrieve all voters from blockchain
    
    const voters = JSON.parse(result.toString());
    const totalCount = voters.length;  // Get the total number of voters
    
    // Return the total count
    res.status(200).json({ totalVoters: totalCount });
  } catch (error) {
    console.error("Error fetching total voters count:", error);
    res.status(500).json({ error: "Error fetching total voters count" });
  }
};

export const getTotalVoteCount = async (req, res) => {
  const adminDID = req.user.did; // Make sure the DID is correctly parsed from the token or request
  if (!adminDID) {
    return res.status(400).json({ error: "User DID is missing in the request" });
  }

  try {
    const contract = await getContract();  // Initialize the Hyperledger contract
    const result = await contract.evaluateTransaction("seeVoteCount", adminDID); // Retrieve all vote counts from blockchain
    
    const voteCounts = JSON.parse(result.toString());
    const totalVoteCount = voteCounts.reduce((sum, candidate) => sum + candidate.votes, 0);  // Sum up all votes
    
    // Return the total vote count
    res.status(200).json({ totalVoteCount });
  } catch (error) {
    console.error("Error fetching total vote count:", error);
    res.status(500).json({ error: "Error fetching total vote count" });
  }
};
// Fetch Voting History
export const getVotingHistory = async (req, res) => {
  try {
    console.log("Request user:", req.user);

    if (!req.user || !req.user.did) {
      return res.status(400).json({ error: "User DID is missing in the request" });
    }

    const contract = await getContract();
    const result = await contract.evaluateTransaction("getVotingHistory", req.user.did);

    const history = JSON.parse(result.toString());
    if (history.length === 0) {
      return res.status(200).json({ history: [] });
    }

    res.status(200).json({ history });
  } catch (error) {
    console.error("Error fetching voting history:", error);
    res.status(500).json({ error: "Error fetching voting history" });
  }
};

// Fetch Notifications
export const getNotifications = async (req, res) => {
  try {
    console.log("Request user:", req.user);

    if (!req.user || !req.user.did) {
      return res.status(400).json({ error: "User DID is missing in the request" });
    }

    const contract = await getContract();
    const result = await contract.evaluateTransaction("getNotifications", req.user.did);

    const notifications = JSON.parse(result.toString());
    if (notifications.length === 0) {
      return res.status(200).json({ notifications: [] });
    }

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Error fetching notifications" });
  }
};


// Fetch Total Voters Count
export const getTotalVotersCountUser = async (req, res) => {
  try {
    console.log("Request user:", req.user);

    if (!req.user || !req.user.did) {
      return res.status(400).json({ error: "User DID is missing in the request" });
    }

    const contract = await getContract();
    const result = await contract.evaluateTransaction("getAllVotersUsers", req.user.did);

    const voters = JSON.parse(result.toString());
    const totalCount = voters.length;

    res.status(200).json({ totalVoters: totalCount });
  } catch (error) {
    console.error("Error fetching total voters count for user:", error);
    res.status(500).json({ error: "Error fetching total voters count for user" });
  }
};

// Fetch Total Vote Count
export const getTotalVoteCountUser = async (req, res) => {
  const { did } = req.user;  // Get 'did' from authenticated user

  console.log('Authenticated user DID:', did);

  if (!did) {
    return res.status(400).json({ error: "User DID is missing in the request" });
  }

  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("seeVoteCount", did);

    const voteCounts = JSON.parse(result.toString());
    const totalVoteCount = voteCounts.reduce((sum, candidate) => sum + candidate.votes, 0);

    res.status(200).json({ totalVoteCount });
  } catch (error) {
    console.error("Error fetching total vote count:", error);
    res.status(500).json({ error: "Error fetching total vote count" });
  }
};

// Fetch Election by ID
// Controller: Example fix for getting election details
export const getElection = async (req, res) => {
  const { electionID } = req.params; // Get electionID from request params
  try {
    const contract = await getContract(); // Get the contract from the Hyperledger fabric network

    // Call the chaincode function to retrieve the election data
    const result = await contract.evaluateTransaction("getElection", electionID); 

    // Check if the result is valid
    if (!result || result.toString() === "") {
      return res.status(404).json({ error: `Election with ID ${electionID} not found` });
    }

    // Parse the result and return the election data in the response
    const election = JSON.parse(result.toString());
    res.status(200).json(election);
  } catch (error) {
    console.error("Error fetching election data:", error);
    res.status(500).json({ error: "Error fetching election data" });
  }
};

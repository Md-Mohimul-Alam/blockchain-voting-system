import bcrypt from "bcryptjs";
import { getContract } from "../config/fabricConfig.js";
import User from "../models/userModel.js";
import Candidate from "../models/candidateModel.js";
import Election from "../models/electionModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import sharp from 'sharp';  // Import Sharp



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
  const { did, name, dob, birthplace } = req.body;
  const logo = req.file;  // Get the logo file

  // Validate if the required fields are provided
  if (!did || !name || !dob || !birthplace || !logo) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Generate a unique candidateID
    const candidateID = generateUniqueID();

    // Process the logo image using sharp (resize and convert to a standard format)
    const processedLogoPath = path.join(uploadDir, `processed-${logo.filename}`);
    await sharp(logo.path)
      .resize(200, 200) // Resize the image to 200x200 pixels
      .toFormat('jpeg') // Convert image to JPEG
      .jpeg({ quality: 80 }) // Set quality to 80%
      .toFile(processedLogoPath); // Save processed logo

    // Create the candidate object with the unique candidateID
    const candidate = {
      candidateID,
      did,
      name,
      dob,
      logo: `processed-${logo.filename}`, // Save the processed logo filename
      birthplace,
      role: "candidate",
      votes: 0,
    };

    // Get the contract to interact with the blockchain
    const contract = await getContract();

    // Submit the transaction to create the candidate on Hyperledger Fabric
    const result = await contract.submitTransaction(
      "createCandidate",
      req.user.did, // Admin's DID
      did,  // Candidate DID
      name, // Candidate Name
      dob,  // Candidate Date of Birth
      `processed-${logo.filename}`,  // Candidate Logo (processed filename)
      birthplace
    );

    // Save the candidate in MongoDB
    await Candidate.create(candidate);

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

    // Ensure election is closed
    const electionAsBytes = await contract.evaluateTransaction("getElection", electionID);
    const election = JSON.parse(electionAsBytes.toString());
    if (election.status !== "closed") {
      return res.status(400).json({ error: "Election must be closed to declare a winner" });
    }

    // Declare the winner using the chaincode function
    const result = await contract.submitTransaction("declareWinner", electionID);
    const winner = result.toString();

    // Update election data with the winner
    await Election.findOneAndUpdate({ electionID }, { winner }, { new: true });

    res.status(200).json({ message: `Winner declared: ${winner}` });
  } catch (error) {
    console.error("Error declaring winner:", error);
    res.status(500).json({ error: error.message || "Error declaring winner" });
  }
};
// Cast vote
export const castVote = async (req, res) => {
  const { did, candidateDid, electionID } = req.body;

  try {
    const contract = await getContract();

    // Step 1: Fetch the election details to check if the winner has been declared
    const electionResult = await contract.evaluateTransaction("getElection", electionID);
    const election = JSON.parse(electionResult.toString());

    // Step 2: Validate if the election is open
    if (election.status !== "open") {
      return res.status(400).json({ error: "Voting is not allowed. Election is closed." });
    }

    // Step 3: Check if the user has already voted
    const userAsBytes = await contract.evaluateTransaction("getPersonalInfo", did);  // Get user details
    const currentUser = JSON.parse(userAsBytes.toString());

    if (currentUser.voted) {
      return res.status(400).json({ error: `User with DID ${did} has already voted` });
    }

    // Step 4: Fetch candidate details using the candidate's DID
    const candidateAsBytes = await contract.evaluateTransaction("getAllCandidatesUsers", candidateDid);
    const candidate = JSON.parse(candidateAsBytes.toString());

    if (!candidate) {
      return res.status(400).json({ error: `Candidate with DID ${candidateDid} does not exist` });
    }

    // Step 5: Increment candidate's vote count
    candidate.votes += 1;

    // Step 6: Mark the user as having voted
    currentUser.voted = true;

    // Step 7: Submit the transaction to cast the vote and update the ledger
    const castVoteResult = await contract.submitTransaction("castVote", did, candidateDid, electionID);

    if (!castVoteResult || castVoteResult.length === 0) {
      return res.status(400).json({ error: "Error casting vote, no result returned from the chaincode" });
    }

    // Step 8: Update the candidate's vote count and the user's voted status
    const updateUserResult = await contract.submitTransaction("updatePersonalInfo", 
      did, 
      currentUser.name, 
      currentUser.dob, 
      currentUser.birthplace, 
      currentUser.userName, 
      currentUser.password
    );

    const updateCandidateResult = await contract.submitTransaction("updateCandidate", 
      candidate.did, 
      candidate.name, 
      candidate.dob, 
      candidate.logo, 
      candidate.birthplace
    );

    // If any of the updates failed, throw an error
    if (!updateUserResult || !updateCandidateResult) {
      throw new Error("Error updating the user or candidate information on the ledger");
    }

    // Return success message
    res.status(200).json({ message: `Vote cast successfully for candidate ${candidateDid}` });

  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({ error: error.message || "Error casting vote" });
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
  const { electionID } = req.params;  // Get electionID from the URL params

  try {
    // Ensure you're connected to the Hyperledger Fabric contract
    const contract = await getContract();

    // Call the chaincode function to reset the election on Hyperledger Fabric
    const result = await contract.submitTransaction('resetElection', electionID);

    // Delete all candidates associated with this election from the ledger
    const candidateIterator = await contract.getStateByRange('candidate-', 'candidate~');
    let candidateResult = await candidateIterator.next();
  
    while (!candidateResult.done) {
      const candidate = JSON.parse(candidateResult.value.value.toString());
      if (candidate.electionID === electionID) {
        // Delete the candidate associated with this election
        await contract.deleteState(candidateResult.value.key);
      }
      candidateResult = await candidateIterator.next();
    }
    await candidateIterator.close();

    // Optionally, delete the election from MongoDB (if needed)
    await Election.findOneAndDelete({ electionID });

    // Optionally, delete the candidates from MongoDB (if needed)
    await Candidate.deleteMany({ electionID });

    // Respond with a success message
    res.status(200).json({ message: `Election ${electionID} and all related data (including candidates, votes, and user data) have been deleted and reset. Election status has been unset.` });
  } catch (error) {
    console.error("Error resetting election:", error);
    res.status(500).json({ error: error.message || "Error resetting election" });
  }
};
// Controller function for viewing election winner
export const seeWinner = async (req, res) => {
  const { electionID } = req.params;  // Election ID from URL parameters

  try {
    const contract = await getContract();  // Get the contract for interacting with Hyperledger Fabric

    // Call the chaincode function to see the winner
    const result = await contract.evaluateTransaction("seeWinner", electionID);  // Call the chaincode function
    const winnerDetails = JSON.parse(result.toString());  // Parse the result to JSON

    // Send the winner details and election status as the response
    res.status(200).json(winnerDetails);
  } catch (error) {
    console.error("Error fetching winner details:", error);
    res.status(500).json({ error: "Error fetching winner details" });
  }
};

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

// Controller for fetching all elections from the ledger
export const getAllElections = async (req, res) => {
  try {
    const contract = await getContract(); // Get the contract from Hyperledger Fabric

    // Call the chaincode function to get all elections
    const result = await contract.evaluateTransaction("getAllElections", ""); 

    if (!result || result.toString() === "") {
      return res.status(404).json({ error: "No elections found" });
    }

    const elections = JSON.parse(result.toString()); // Parse the response to get the elections
    res.status(200).json({ elections }); // Return all elections
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ error: "Error fetching elections" });
  }
};

// Controller for fetching election by Election ID
export const getElectionById = async (req, res) => {
  const { electionID } = req.params; // Get electionID from request params
  try {
    const contract = await getContract(); // Get the contract from Hyperledger Fabric

    // Call the chaincode function to retrieve the election data by Election ID
    const result = await contract.evaluateTransaction("getElection", electionID);

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

export const updateUser = async (req, res) => {
  const { did, name, dob, birthplace, userName, password } = req.body;

  try {
    // Hash the password if it is provided for update
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hash the new password
    }

    const contract = await getContract();

    // Call the chaincode function to update user info
    const result = await contract.submitTransaction(
      "updateUser", // Chaincode function name
      did,          // DID of the user to update
      name,         // New name
      dob,          // New date of birth
      birthplace,   // New birthplace
      userName,     // New userName
      hashedPassword // New hashed password (if updated)
    );

    // Parse the result (updated user data) returned from chaincode
    const updatedUser = JSON.parse(result.toString());

    // Optionally, update the user details in MongoDB (if you're storing users there)
    await User.findOneAndUpdate({ did }, updatedUser, { new: true });

    // Return the updated user data as a response
    res.status(200).json({ message: "User details updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};
import axios from "axios";

// Create an Axios instance with a base URL
const API = axios.create({ baseURL: "http://localhost:5001/api" });

// Admin APIs
export const registerAdmin = (data) => API.post("/admin/register", data); // Register an admin
export const loginAdmin = (data) => API.post("/admin/login", data);       // Admin login
export const updateAdmin = (data) => API.put("/admin/update", data);      // Update admin details

// User APIs
export const registerUser = (data) => API.post("/user/register", data);   // Register a user
export const loginUser = (data) => API.post("/user/login", data);         // User login
export const updateUserInfo = (data) => API.put("/user/update", data);    // Update user details
export const getUserInfo = (did) => API.get(`/user/${did}`);              // Get personal information

// Candidate APIs
export const createCandidate = (data) =>
  API.post("/candidate/create", data, { headers: { "Content-Type": "multipart/form-data" } }); // Create a candidate with a logo
export const getAllCandidates = () => API.get("/candidate/all");          // Retrieve all candidates
export const deleteCandidate = (did) => API.delete(`/candidate/${did}`);  // Delete a candidate by DID

// Election APIs
export const declareWinner = (electionID) =>
  API.post(`/election/${electionID}/winner`);                             // Declare election winner
export const closeElection = (electionID) =>
  API.post(`/election/${electionID}/close`);                              // Close an election
export const resetElection = (electionID) =>
  API.post(`/election/${electionID}/reset`);                              // Reset an election

// Voting APIs
export const castVote = (data) => API.post("/user/vote", data);           // Cast a vote for a candidate
export const seeWinner = (electionID) =>
  API.get(`/user/winner/${electionID}`);                                  // View election winner

// General utility APIs
export const getVoteCounts = () => API.get("/candidate/voteCounts");      // View vote count for all candidates

export default API;

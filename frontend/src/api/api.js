// src/api/api.js
import API from "./axiosConfig";

// Admin APIs
export const registerAdmin = (data) => API.post("/admin/register", data);
export const loginAdmin = (data) => API.post("/admin/login", data);
export const updateAdmin = (data) => API.put("/admin/update", data);

// User APIs
export const registerUser = (data) => API.post("/user/register", data);
export const loginUser = (data) => API.post("/user/login", data);
export const updateUserInfo = (data) => API.put("/user/update", data);
export const getUserInfo = (did) => {
  return API.get(`/user/${did}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,  // Pass the JWT token for authentication
    },
  });
};

// Candidate APIs
export const createElection = (data) => API.post("/election/create", data); // To create a new election
export const createCandidate = (data) => API.post("/candidate/create", data, { headers: { "Content-Type": "multipart/form-data" } });
export const getAllCandidates = () => API.get("/candidate/all");
export const deleteCandidate = (did) => API.delete(`/candidate/${did}`);

export const getAllCandidatesUser = () => API.get("/candidateUser/all");

// Election APIs
export const declareWinner = (electionID) => API.post(`/election/${electionID}/winner`);
export const closeElection = (electionID) => API.post(`/election/${electionID}/close`);
export const resetElection = (electionID) => API.post(`/election/${electionID}/reset`);

// Voting APIs
export const castVote = (data) => API.post("/user/vote", data);
export const seeWinner = (electionID) => API.get(`/user/winner/${electionID}`);

// Aggregate APIs (Newly added for aggregate data)
export const getTotalCandidatesCount = () => {
  return API.get("/total-candidates", {
    params: { type: "aggregate" }, // Indicate it's an aggregate request
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  });
};

export const getTotalVotersCount = () => {
  return API.get("/total-voters", {
    params: { type: "aggregate" }, // Indicate it's an aggregate request
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  });
};

export const getTotalVoteCount = () => {
  return API.get("/total-vote-count", {
    params: { type: "aggregate" }, // Indicate it's an aggregate request
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  });
};

export const getVoteCounts = () => API.get("/candidate/voteCounts");

export default API; // You can export the API instance as well if needed

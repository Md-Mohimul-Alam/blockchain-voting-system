import { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Your API configuration

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [votingMessage, setVotingMessage] = useState(null);  // Display vote status message
  const [ELECTION_ID, setElectionID] = useState("Election1"); // Election ID, can be dynamic
  const [userDid, setUserDid] = useState(""); // Store the user's DID for later use

  // Function to fetch candidates with DID from localStorage
  const fetchCandidates = async () => {
    const token = localStorage.getItem("did");  // Retrieve DID from localStorage
    if (!token) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    setUserDid(token);  // Set the User DID into state

    try {
      // Fetch candidates from the API and pass the token in the request headers
      const response = await API.get("/candidateUser/all", {
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the token in the Authorization header
        },
      });

      setCandidates(response.data); // Set candidates data
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError(error.response ? error.response.data.error : "Failed to fetch candidates");
    }
  };

  // Function to cast the vote
  const castVote = async (candidateDid) => {
    if (!userDid) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    const voteData = {
      candidateDid,
      electionID: ELECTION_ID,  // Set election ID
    };

    try {
      const response = await API.post("/vote", voteData, {
        headers: {
          Authorization: `Bearer ${userDid}`,  // Pass the User DID in the Authorization header
        },
      });

      setVotingMessage(response.data.message); // Display success message after vote
    } catch (error) {
      console.error("Error casting vote:", error);
      setVotingMessage(error.response ? error.response.data.error : "Error casting vote");
    }
  };

  // Fetch candidates when the component mounts
  useEffect(() => {
    fetchCandidates(); // Call the fetchCandidates function to get data
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="text-3xl font-semibold text-center mb-6">Vote Now</div>

      {/* Show any error or success message */}
      {error && <div className="bg-red-200 text-red-800 p-4 rounded-lg mb-4 shadow-lg">{error}</div>}
      {votingMessage && <div className="bg-green-200 text-green-800 p-4 rounded-lg mb-4 shadow-lg">{votingMessage}</div>}

      {/* List of Candidates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.did}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between items-center hover:shadow-xl transition duration-300"
          >
            <img 
              src={`/uploads/${candidate.logo}`} 
              alt={`${candidate.name}'s Logo`} 
              className="w-24 h-24 mb-4 object-contain"
            />
            <div className="text-center mb-4">
              <h4 className="text-xl font-semibold text-gray-800">{candidate.name}</h4>
              <div className="text-gray-500">Candidate DID: {candidate.did}</div>
              <div className="text-gray-400">Candidate Birthplace: {candidate.birthplace}</div>
            </div>
            <button
              onClick={() => castVote(candidate.did)}  // Handle the vote
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none"
            >
              Vote Now
            </button>
          </div>
        ))}
      </div>

      {/* Loader while fetching candidates */}
      {!candidates.length && !error && !votingMessage && (
        <div className="text-center text-xl text-gray-500">
          <p>Loading candidates...</p>
        </div>
      )}
    </div>
  );
};

export default Vote;

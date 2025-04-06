import { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Import centralized API instance

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [electionID, setElectionID] = useState(""); // Election ID

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await API.get("/candidates/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is sent in request
          },
        });
        setCandidates(response.data); // Set candidates data
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setError("Failed to fetch candidates");
      }
    };

    // Set election ID (you can set this dynamically based on your application's context)
    setElectionID("Election1"); // Replace with dynamic election ID fetching
    fetchCandidates();
  }, []);

  const handleVote = async (candidateId) => {
    const userDID = localStorage.getItem("userDID"); // Get user DID (ensure it's available in local storage)
    
    if (!userDID) {
      setError("User ID not found. Please log in again.");
      return;
    }

    const voteData = {
      did: userDID,
      candidateDid: candidateId,
      electionID: electionID,
    };

    try {
      const response = await API.post("/vote", voteData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure the token is sent with the request
        },
      });
      alert(response.data.message); // Show success message
    } catch (error) {
      console.error("Error casting vote:", error);
      setError(error.response ? error.response.data.error : "Error casting vote");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h3 className="text-3xl font-semibold text-center mb-6">Vote Now</h3>
      {error && <div className="bg-red-200 text-red-800 p-4 rounded-lg mb-4">{error}</div>}

      {/* List of Candidates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.did}
            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
          >
            <div>
              <h4 className="text-xl font-semibold">{candidate.name}</h4>
              <p className="text-gray-500">Party: {candidate.party || "N/A"}</p>
            </div>
            <button
              onClick={() => handleVote(candidate.did)}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Vote
            </button>
          </div>
        ))}
      </div>

      {/* Loader while fetching candidates */}
      {!candidates.length && !error && (
        <div className="text-center text-xl text-gray-500">
          <p>Loading candidates...</p>
        </div>
      )}
    </div>
  );
};

export default Vote;

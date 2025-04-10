import React, { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Import centralized API instance
import PlayOnce from "../../assets/com1";
import PlayTwice from "../../assets/com2"; // Lottie components for icons

const OverviewTab = () => {
  // States to hold the data fetched from the APIs
  const [candidates, setCandidates] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [electionStatus, setElectionStatus] = useState("Open"); // Default value
  const [electionDates, setElectionDates] = useState({ startDate: "" });
  const [votingHistory, setVotingHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const [electionID, setElectionID] = useState(""); // Election ID dynamically selected

  // Fetch candidates
  const fetchCandidates = async () => {
    const token = localStorage.getItem("did");  // Retrieve DID from localStorage
    if (!token) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await API.get("/candidateUser/all", {
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the token in the Authorization header
        },
      });

      setCandidates(response.data); // Set candidates data
      console.log(`Total candidates: ${response.data.length}`); // Count and log the number of candidates
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError(error.response ? error.response.data.error : "Failed to fetch candidates");
    }
  };

  // Function to fetch total voters count
  const fetchTotalVotersCount = async () => {
    const token = localStorage.getItem("jwtToken");  // Retrieve JWT from localStorage
    if (!token) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await API.get("/total-voters-user", {
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the JWT in the Authorization header
        },
      });
      setTotalVoters(response.data.totalVoters); // Set total voters state
    } catch (error) {
      console.error("Error fetching total voters:", error);
      setError("Failed to fetch total voters");
    }
  };

  // Function to fetch total votes count
  const fetchTotalVotesCount = async () => {
    const did = localStorage.getItem("did");  // Retrieve DID from localStorage
    const token = localStorage.getItem("jwtToken");  // Retrieve JWT from localStorage
    if (!token) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await API.get("/total-vote-count-user", {
        headers: {
          Authorization: `Bearer ${did}`,  // Pass the JWT in the Authorization header
        },
      });
      setTotalVotes(response.data.totalVoteCount); // Set total votes state
    } catch (error) {
      console.error("Error fetching total vote count:", error);
      setError("Failed to fetch total votes");
    }
  };

  // Function to fetch election status
  const fetchElectionStatus = async () => {
    const token = localStorage.getItem("jwtToken"); // Retrieve JWT from localStorage
    if (!token) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await API.get(`/election/${electionID}/status`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the JWT in the Authorization header
        },
      });
      setElectionStatus(response.data.status); // Set election status
    } catch (error) {
      console.error("Error fetching election status:", error);
      setError("Failed to fetch election status");
    }
  };

  // Function to fetch election dates
  const fetchElectionDates = async () => {
    const token = localStorage.getItem("jwtToken"); // Retrieve JWT from localStorage
    if (!token) {
      setError("User is not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await API.get(`/election/${electionID}/dates`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the JWT in the Authorization header
        },
      });
      setElectionDates(response.data.dates); // Set election dates (startDate and endDate)
    } catch (error) {
      console.error("Error fetching election dates:", error);
      setError("Failed to fetch election dates");
    }
  };

  // Function to fetch voting history
  const fetchVotingHistory = () => {
    const storedHistory = localStorage.getItem("votingHistory");
    if (storedHistory) {
      setVotingHistory(JSON.parse(storedHistory)); // Set the voting history from localStorage
    } else {
      setError("No voting history found.");
    }
  };

  // Fetch all elections (if applicable) - Add this function to retrieve all elections
  const fetchAllElections = async () => {
    try {
      const response = await API.get("/elections"); // API endpoint to fetch all elections
      if (response.data && response.data.elections.length > 0) {
        setElectionID(response.data.elections[0].electionID); // Set the first election as default
        fetchElectionStatus(); // Fetch status of the first election
        fetchElectionDates(); // Fetch dates of the first election
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
      setError("Failed to fetch elections");
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchTotalVotersCount();
    fetchTotalVotesCount();
    fetchAllElections(); // Fetch elections and update the selected election details
    fetchVotingHistory(); // Call the function to load the voting history
  }, []);

  return (
    <div className="flex flex-col justify-center items-start pt-0 py-10 px-5 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-2 gap-6 w-full max-w-6xl pt-0">
        {/* Total Candidates Card */}
        <div className="flex items-center justify-between p-6 bg-blue-500 text-white rounded-lg shadow-md">
          <div>
            <div className="text-xl font-semibold">Total Candidates</div>
            <div className="text-3xl font-extrabold">{candidates.length}</div>
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayOnce />
          </div>
        </div>

        {/* Total Voters Card */}
        <div className="flex items-center justify-between p-6 bg-green-500 text-white rounded-lg shadow-md">
          <div>
            <div className="text-xl font-semibold">Total Voters</div>
            <div className="text-3xl font-extrabold">{totalVoters}</div>
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayTwice style={{ width: "60px", height: "60px" }} />
          </div>
        </div>

        {/* Total Vote Count Card */}
        <div className="flex items-center justify-between p-6 bg-yellow-500 text-white rounded-lg shadow-md">
          <div>
            <div className="text-xl font-semibold">Total Vote Count</div>
            <div className="text-3xl font-extrabold">{totalVotes}</div>
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayOnce />
          </div>
        </div>

        {/* Election Status Card */}
        <div className="flex items-center justify-between p-6 bg-purple-500 text-white rounded-lg shadow-md">
          <div>
            <div className="text-xl font-semibold">Election Status</div>
            <div className="text-3xl font-extrabold">{electionStatus}:({electionID})</div>
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayTwice style={{ width: "60px", height: "60px" }} />
          </div>
        </div>
      </div>

      {/* Election Dates Card */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-300 rounded-lg shadow-md mt-6 w-full max-w-6xl">
        <div className="text-xl font-semibold">Running Election </div>
        <div className="text-xl font-extrabold">{electionID}</div>
      </div>

      {/* Voting History */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-300 rounded-lg shadow-md mt-6 w-full max-w-6xl">
        <div className="text-xl font-semibold mb-4">Your Voting History</div>

        {/* If no voting history exists */}
        {votingHistory.length === 0 ? (
          <div className="text-lg text-gray-600">You have not voted yet.</div>
        ) : (
          <ul className="space-y-4 w-full">
            {votingHistory.map((vote, index) => (
              <li key={index} className="bg-white p-4 rounded-lg shadow-md flex flex-col mb-2">
                <div className="font-semibold text-lg">{vote.candidateName}</div>
                <div className="text-sm text-gray-500">Vote Time: {new Date(vote.voteDate).toLocaleString()}</div>
                <div className="mt-2 text-gray-700">You have voted for the election "{vote.electionName}".</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notifications */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-300 rounded-lg shadow-md mt-6 w-full max-w-6xl">
        <div className="text-xl font-semibold">Notifications</div>
        <ul className="space-y-4">
          {notifications.map((notification, index) => (
            <li key={index} className="text-lg">{notification}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverviewTab;
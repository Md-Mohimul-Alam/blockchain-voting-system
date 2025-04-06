import React, { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Import centralized API instance
import PlayOnce from "../../assets/com1";
import PlayTwice from "../../assets/com2"; // Lottie components for icons

const OverviewTab = () => {
  // States to hold the data fetched from the APIs
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [electionStatus, setElectionStatus] = useState("Open"); // Default value
  const [electionDates, setElectionDates] = useState({ startDate: "", endDate: "" });
  const [votingHistory, setVotingHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchTotalCandidatesCount = async () => {
      try {
        const response = await API.get("/total-candidates", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTotalCandidates(response.data.totalCandidates);
      } catch (error) {
        console.error("Error fetching total candidates:", error);
        setError("Failed to fetch total candidates");
      }
    };

    const fetchTotalVotersCount = async () => {
      try {
        const response = await API.get("/total-voters", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTotalVoters(response.data.totalVoters);
      } catch (error) {
        console.error("Error fetching total voters:", error);
        setError("Failed to fetch total voters");
      }
    };

    const fetchTotalVotesCount = async () => {
      try {
        const response = await API.get("/total-vote-count", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTotalVotes(response.data.totalVoteCount);
      } catch (error) {
        console.error("Error fetching total votes:", error);
        setError("Failed to fetch total votes");
      }
    };

    const fetchElectionStatus = async () => {
      try {
        const response = await API.get("/election/status", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setElectionStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching election status:", error);
        setError("Failed to fetch election status");
      }
    };

    const fetchElectionDates = async () => {
      try {
        const response = await API.get("/election/dates", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setElectionDates(response.data.dates);
      } catch (error) {
        console.error("Error fetching election dates:", error);
        setError("Failed to fetch election dates");
      }
    };

    const fetchVotingHistory = async () => {
      try {
        const response = await API.get("/user/voting-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setVotingHistory(response.data.history);
      } catch (error) {
        console.error("Error fetching voting history:", error);
        setError("Failed to fetch voting history");
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await API.get("/user/notifications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to fetch notifications");
      }
    };

    // Call all the fetch functions
    fetchTotalCandidatesCount();
    fetchTotalVotersCount();
    fetchTotalVotesCount();
    fetchElectionStatus();
    fetchElectionDates();
    fetchVotingHistory();
    fetchNotifications();
  }, []);

  return (
    <div className="flex flex-col justify-center items-start pt-0 py-10 px-5 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-2 gap-6 w-full max-w-6xl pt-0">
        {/* Total Candidates Card */}
        <div className="flex items-center justify-between p-6 bg-blue-500 text-white rounded-lg shadow-md">
          <div>
            <h3 className="text-xl font-semibold">Total Candidates</h3>
            {error ? (
              <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-2">{error}</div>
            ) : (
              <div className="text-3xl font-extrabold">{totalCandidates}</div>
            )}
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayOnce />
          </div>
        </div>

        {/* Total Voters Card */}
        <div className="flex items-center justify-between p-6 bg-green-500 text-white rounded-lg shadow-md">
          <div>
            <h3 className="text-xl font-semibold">Total Voters</h3>
            {error ? (
              <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-2">{error}</div>
            ) : (
              <div className="text-3xl font-extrabold">{totalVoters}</div>
            )}
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayTwice style={{ width: "60px", height: "60px" }} />
          </div>
        </div>

        {/* Total Vote Count Card */}
        <div className="flex items-center justify-between p-6 bg-yellow-500 text-white rounded-lg shadow-md">
          <div>
            <h3 className="text-xl font-semibold">Total Vote Count</h3>
            {error ? (
              <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-2">{error}</div>
            ) : (
              <div className="text-3xl font-extrabold">{totalVotes}</div>
            )}
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayOnce />
          </div>
        </div>

        {/* Election Status Card */}
        <div className="flex items-center justify-between p-6 bg-purple-500 text-white rounded-lg shadow-md">
          <div>
            <h3 className="text-xl font-semibold">Election Status</h3>
            {error ? (
              <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-2">{error}</div>
            ) : (
              <div className="text-3xl font-extrabold">{electionStatus}</div>
            )}
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayTwice style={{ width: "60px", height: "60px" }} />
          </div>
        </div>
      </div>

      {/* Election Dates Card */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-300 rounded-lg shadow-md mt-6 w-full max-w-6xl">
        <h3 className="text-xl font-semibold">Election Dates</h3>
        <div className="text-xl font-extrabold">{electionDates.startDate} - {electionDates.endDate}</div>
      </div>

      {/* Voting History */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-300 rounded-lg shadow-md mt-6 w-full max-w-6xl">
        <h3 className="text-xl font-semibold">Your Voting History</h3>
        <ul className="space-y-4">
          {votingHistory.map((vote, index) => (
            <li key={index} className="text-lg">{vote}</li>
          ))}
        </ul>
      </div>

      {/* Notifications */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-300 rounded-lg shadow-md mt-6 w-full max-w-6xl">
        <h3 className="text-xl font-semibold">Notifications</h3>
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

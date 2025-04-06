import React, { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Import centralized API instance
import PlayOnce from '../../assets/com1';
import PlayTwice from '../../assets/com2';

const OverviewTab = () => {
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0); // New state for total votes
  const [error, setError] = useState(null); // Add error state for handling API errors

  // Fetch total candidates count and total voters count on component mount
  useEffect(() => {
    const fetchTotalCandidatesCount = async () => {
      try {
        const response = await API.get("/total-candidates", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTotalCandidates(response.data.totalCandidates); // Set total candidates state
      } catch (error) {
        console.error("Error fetching total candidates:", error);
        setError("Failed to fetch total candidates"); // Set error state
      }
    };

    const fetchTotalVotersCount = async () => {
      try {
        const response = await API.get("/total-voters", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTotalVoters(response.data.totalVoters); // Set total voters state
      } catch (error) {
        console.error("Error fetching total voters:", error);
        setError("Failed to fetch total voters"); // Set error state
      }
    };

    const fetchTotalVotesCount = async () => {
      try {
        const response = await API.get("/total-vote-count", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTotalVotes(response.data.totalVoteCount); // Set total votes state
      } catch (error) {
        console.error("Error fetching total vote count:", error);
        setError("Failed to fetch total votes"); // Set error state
      }
    };

    // Fetch data when the component is mounted
    fetchTotalCandidatesCount();
    fetchTotalVotersCount();
    fetchTotalVotesCount();
  }, []);

  return (
    <div className="flex flex-col justify-center items-start pt-0 py-10 px-5 bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-6xl pt-0">
        {/* Total Candidates Card */}
        <div className="flex items-center justify-between p-6 bg-blue-500 text-white rounded-lg shadow-md ">
          <div>
            <h3 className="text-xl font-semibold">Total Candidates</h3>
            {error ? (
              <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-2">
                {error}
              </div>
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
              <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-2">
                {error}
              </div>
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
              <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-2">
                {error}
              </div>
            ) : (
              <div className="text-3xl font-extrabold">{totalVotes}</div>
            )}
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayOnce />
          </div>
        </div>

        {/* Additional Info 2 Card */}
        <div className="flex items-center justify-between p-6 bg-red-500 text-white rounded-lg shadow-md">
          <div>
            <h3 className="text-xl font-semibold">Additional Info 2</h3>
            <div className="text-3xl font-extrabold"></div> {/* Hardcoded for now */}
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <PlayTwice style={{ width: "60px", height: "60px" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;

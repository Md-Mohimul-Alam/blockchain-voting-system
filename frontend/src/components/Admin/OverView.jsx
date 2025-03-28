import React, { useState, useEffect } from "react";
import axios from "axios";

const OverviewTab = () => {
    const [selectedTab, setSelectedTab] = useState("overview"); // Default to "overview"
    const [totalCandidates, setTotalCandidates] = useState(0);
  
    useEffect(() => {
        const fetchCandidateCount = async () => {
            try {
              const response = await axios.get("http://localhost:5001/api/total-candidates", {  // Use the correct backend URL
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is passed if authentication is required
                },
              });
              setTotalCandidates(response.data.totalCandidates);
            } catch (error) {
              console.error("Error fetching candidate count:", error);
            }
          };
          
      fetchCandidateCount();
    }, []);
  
    return (
      <div className="flex flex-col justify-center items-center py-10 px-5 bg-gray-50 min-h-screen">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedTab("overview")}
            className={`px-4 py-2 rounded ${selectedTab === "overview" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab("details")}
            className={`px-4 py-2 rounded ${selectedTab === "details" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Details
          </button>
        </div>
  
        {selectedTab === "overview" && (
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
              Welcome, Admin! View system statistics here.
            </h2>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
              <h3 className="text-2xl font-semibold text-gray-700">Total Candidates</h3>
              <div className="text-5xl font-extrabold text-indigo-600">{totalCandidates}</div>
              <p className="text-lg text-gray-500">The total number of candidates currently registered in the system.</p>
            </div>
          </div>
        )}
  
        {selectedTab === "details" && (
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
              Details Tab Content
            </h2>
          </div>
        )}
      </div>
    );
  };
export default OverviewTab;

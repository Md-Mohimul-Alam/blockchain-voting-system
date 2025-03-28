import { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import API from "../api/axiosConfig"; // Importing centralized API instance
import CandidateForm from "../components/Admin/CandidateForm";
import CandidateUpdateForm from "../components/Admin/CandidateUpdateForm";
import CandidateList from "../components/Admin/CandidateList";
import OverviewTab from "../components/Admin/OverView"; // Import the OverviewTab component

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);  // Track loading state
  const [error, setError] = useState(null);  // Track error state
  const [selectedCandidate, setSelectedCandidate] = useState(null); // For editing a candidate

  const fetchCandidates = async () => {
    setLoading(true); // Set loading to true before making the request
    setError(null); // Reset previous error if any

    try {
      const response = await API.get("/candidate/all");  // Use centralized API instance
      setCandidates(response.data); // Use the data to update state
      setLoading(false);  // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError(error.response ? error.response.data.message : "Failed to fetch candidates!");
      setLoading(false);  // Set loading to false after error is caught
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin setSelectedTab={setSelectedTab} />

      <div className="flex-1 p-6">
        {selectedTab === "overview" && (
          <OverviewTab />  // Import and render the OverviewTab component here
        )}

        {/* Add Candidate Form */}
        {selectedTab === "addCandidate" && (
          <CandidateForm fetchCandidates={fetchCandidates} setSelectedTab={setSelectedTab} />
        )}

        {/* Update Candidate Form */}
        {selectedTab === "updateCandidate" && (
          <CandidateUpdateForm
            fetchCandidates={fetchCandidates}
            setSelectedTab={setSelectedTab}
            selectedCandidate={selectedCandidate}
            setSelectedCandidate={setSelectedCandidate}
          />
        )}

        {/* Candidates List */}
        {selectedTab === "AllCandidates" && (
          <CandidateList
            candidates={candidates}
            loading={loading}
            error={error}
            setSelectedTab={setSelectedTab}
            setSelectedCandidate={setSelectedCandidate}
            fetchCandidates={fetchCandidates}
          />
        )}

        {/* Loading State */}
        {loading && <div className="text-center">Loading candidates...</div>}

        {/* Error State */}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;

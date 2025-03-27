import { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import axios from "axios";
import CandidateForm from "../components/Admin/CandidateForm";
import CandidateUpdateForm from "../components/Admin/CandidateUpdateForm";
import CandidateList from "../components/Admin/CandidateList";

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);  // Track loading state
  const [error, setError] = useState(null);  // Track error state
  const [selectedCandidate, setSelectedCandidate] = useState(null); // For editing a candidate

  const fetchCandidates = () => {
    setLoading(true); // Set loading to true before making the request
    setError(null); // Reset previous error if any
    axios
      .get("http://localhost:5001/api/candidates/all")
      .then((response) => {
        setCandidates(response.data); // Use the data to update state
        setLoading(false);  // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching candidates:", error); // Log the error
        setError("Failed to fetch candidates!");  // Update error state
        setLoading(false);  // Set loading to false after error is caught
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin setSelectedTab={setSelectedTab} />

      <div className="flex-1 p-6">
        {/* Tab-Based Rendering */}
        {selectedTab === "overview" && <div className="text-black">Welcome, Admin! View system statistics here.</div>}

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
      </div>
    </div>
  );
};

export default AdminDashboard;

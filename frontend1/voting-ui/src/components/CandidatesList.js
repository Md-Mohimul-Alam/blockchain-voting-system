import React from "react";
import axios from "axios";
import { API_URL } from "../config/api";  // Make sure you have your API_URL configured

const CandidatesList = ({ candidates, setCandidates }) => {
  // Handler for deleting a candidate
  const handleDeleteCandidate = async (candidateID) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Send delete request to the server
      const response = await axios.delete(`${API_URL}/deleteCandidate`, {
        headers,
        data: { candidateID }, // Sending candidateID to delete
      });

      if (response.data.success) {
        // Filter out the deleted candidate from the list
        const updatedCandidates = candidates.filter(
          (candidate) => candidate.candidateID !== candidateID
        );
        setCandidates(updatedCandidates);  // Update the state to reflect the deletion
        alert(`✅ Candidate ${candidateID} deleted successfully!`);
      }
    } catch (error) {
      console.error("❌ Error deleting candidate:", error);
      alert(error.response?.data?.error || "❌ Error deleting candidate.");
    }
  };

  return (
    <div>
      <h2>Candidates List</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>DOB</th>
            <th>Logo</th> {/* Logo column */}
            <th>Actions</th> {/* Action column for delete button */}
          </tr>
        </thead>
        <tbody>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <tr key={candidate.candidateID}>
                <td>{candidate.candidateID}</td>
                <td>{candidate.name}</td>
                <td>{candidate.dob}</td>
                <td>
                  {/* Conditionally render logo */}
                  {candidate.logo ? (
                    <img
                      src={`http://localhost:5000/uploads/logos/${candidate.logo}`}  // Adjust URL as needed
                      alt={`${candidate.name} logo`}
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  ) : (
                    <span>No logo</span>
                  )}
                </td>
                <td>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteCandidate(candidate.candidateID)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No candidates found.</td> {/* Adjusted colspan for new Actions column */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CandidatesList;

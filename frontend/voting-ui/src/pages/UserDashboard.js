import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/api";
import "./Dashboard.css";

const UserDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [voted, setVoted] = useState(false);
  const [winner, setWinner] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const did = localStorage.getItem("did");

    if (!token || role !== "voter") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // ✅ Fetch Candidates, User Info & Winner Data
        const [candidatesRes, userRes, winnerRes] = await Promise.all([
          axios.get(`${API_URL}/listCandidates`, { headers }),
          axios.post(`${API_URL}/getUserInfo`, { did }, { headers }),
          axios.get(`${API_URL}/getWinner`, { headers }),
        ]);

        setCandidates(candidatesRes.data);
        setUserInfo(userRes.data);
        setVoted(userRes.data.hasVoted);
        if (winnerRes.data.success) setWinner(winnerRes.data.winner);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleVote = async (candidateID) => {
    const token = localStorage.getItem("token");
    const did = localStorage.getItem("did");

    if (voted) {
      alert("⚠️ You have already voted!");
      return;
    }

    try {
      await axios.post(`${API_URL}/vote`, { voterDID: did, candidateID }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`✅ Vote cast successfully for Candidate ID: ${candidateID}`);
      setVoted(true);
    } catch (error) {
      console.error("❌ Vote Error:", error.response?.data || error);
      alert(error.response?.data?.error || "❌ Error casting vote.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>User Dashboard</h1>

      {/* ✅ Personal Info */}
      <div className="user-info">
        <h2>📌 Your Info</h2>
        <p><strong>DID:</strong> {userInfo.did}</p>
        <p><strong>User ID:</strong> {userInfo.userId}</p>
        <p><strong>District:</strong> {userInfo.district}</p>
        <p><strong>Voting Status:</strong> {voted ? "✅ Voted" : "❌ Not Voted Yet"}</p>
      </div>

      {/* ✅ Vote for Candidates */}
      <h2>🗳️ Cast Your Vote</h2>
      {candidates.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate ID</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Logo</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.candidateID}>
                  <td>{candidate.candidateID}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.dob}</td>
                  <td>
                    {candidate.logo && (
                      <img src={`${API_URL}/uploads/${candidate.logo}`} alt="Candidate Logo" width="50" />
                    )}
                  </td>
                  <td>
                    <button className="vote-btn" onClick={() => handleVote(candidate.candidateID)} disabled={voted}>
                      {voted ? "Voted" : "Vote"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No candidates available.</p>
      )}

      {/* ✅ Election Winner */}
      {winner && (
        <div className="winner-container">
          <h2>🏆 Election Winner</h2>
          <p><strong>Candidate ID:</strong> {winner.candidateID}</p>
          <p><strong>Name:</strong> {winner.name}</p>
          <p><strong>Total Votes:</strong> {winner.votes}</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

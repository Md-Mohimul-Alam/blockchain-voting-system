import { useState, useEffect } from "react";
import { api } from "../config/api";

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data } = await api.get("/vote/candidates");
      setCandidates(data);
    };
    fetchCandidates();
  }, []);

  const handleVote = async () => {
    const voterDID = localStorage.getItem("voterDID");
    if (!voterDID) return alert("You must be logged in to vote!");

    await api.post("/vote", { voterDID, candidateID: selectedCandidate });
    alert("Vote cast successfully!");
  };

  return (
    <div>
      <h2>Vote for a Candidate</h2>
      <select onChange={(e) => setSelectedCandidate(e.target.value)}>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button onClick={handleVote}>Vote</button>
    </div>
  );
};

export default Vote;

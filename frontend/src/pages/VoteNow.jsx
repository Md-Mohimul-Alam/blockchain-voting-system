import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

const VoteNow = () => {
  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/election/active", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setElection(res.data);
      } catch (error) {
        toast.error("Failed to load election");
        console.error("Election fetch error:", error);
      }
    };

    fetchElection();
  }, []);

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate to vote");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/vote",
        { candidateId: selectedCandidate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Your vote has been cast!");
      setSelectedCandidate("");
    } catch (error) {
      toast.error("Voting failed");
      console.error("Vote error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!election) return <p className="p-6 text-center">Loading election...</p>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{election.title}</h1>
      <p className="mb-6 text-gray-700">{election.description}</p>

      <form onSubmit={(e) => e.preventDefault()} className="grid gap-4">
        {election.candidates.map((candidate) => (
          <label key={candidate.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="candidate"
              value={candidate.id}
              checked={selectedCandidate === candidate.id}
              onChange={() => setSelectedCandidate(candidate.id)}
              className="accent-blue-600"
            />
            <span>{candidate.name}</span>
          </label>
        ))}

        <button
          onClick={handleVote}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-4"
        >
          {loading ? "Submitting..." : "Submit Vote"}
        </button>
      </form>
    </div>
  );
};

export default VoteNow;

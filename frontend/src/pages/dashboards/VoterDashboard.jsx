import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "@/services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const VoterDashboard = () => {
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [elections, setElections] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [winner, setWinner] = useState(null);

  const fetchRunningElections = useCallback(async () => {
    try {
      const response = await API.get("/elections/running");
      setElections(response.data || []);
    } catch (error) {
      console.error("Error fetching running elections:", error);
      toast({
        title: "Failed to fetch running elections",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchTotalVotes = useCallback(async () => {
    try {
      const response = await API.get("/vote/count/all");
      setTotalVotes(response.data.totalVotes || 0);
    } catch (error) {
      console.error("Error fetching total votes:", error);
    }
  }, []);

  const castVote = useCallback(async (electionId, candidateDid) => {
    try {
      const voterDid = userData?.did;
      await API.post("/vote", { electionId, voterDid, candidateDid });
      toast({ title: "Vote casted successfully!", variant: "success" });

      // 📝 Save to localStorage
      localStorage.setItem("lastVotedElection", JSON.stringify({ electionId, voterDid, candidateDid }));

      fetchRunningElections();
      fetchTotalVotes();
      checkElectionResults(); // Immediately try fetching winner
    } catch (error) {
      console.error("Vote error:", error);
      toast({
        title: "Failed to cast vote",
        description: error.response?.data?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }, [userData, toast, fetchRunningElections, fetchTotalVotes]);

  const checkElectionResults = useCallback(async () => {
    try {
      const lastVote = JSON.parse(localStorage.getItem("lastVotedElection"));
      const electionId = lastVote?.electionId;

      if (!electionId) {
        console.warn("No electionId found in localStorage.");
        return;
      }

      const resultResponse = await API.get(`/vote/result/${electionId}`);
      
      if (resultResponse.data) {
        const { winner, maxVotes, totalCandidates, totalVotes } = resultResponse.data;

        setWinner({
          winner: {
            fullName: winner.fullName,
            image: winner.image,
            did: winner.did,
          },
          maxVotes,
          totalCandidates,
          totalVotes,
        });
      } else {
        setWinner(null);
      }
    } catch (error) {
      console.error("Error fetching election results:", error);
      toast({
        title: "Failed to fetch election results",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setUserData(JSON.parse(user));
  }, []);

  useEffect(() => {
    if (userData?.role?.toLowerCase() === "voter") {
      fetchRunningElections();
      fetchTotalVotes();
      checkElectionResults(); // Automatically fetch winner if user reloads later
    }
  }, [userData, fetchRunningElections, fetchTotalVotes, checkElectionResults]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Dashboard Header */}
      <div className="p-8 bg-teal-800 text-white text-center shadow-xl mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-purple-500 to-teal-500 text-transparent bg-clip-text">
            {userData?.role || "User"}
          </span>{" "}
          Dashboard
        </h1>
        <h2 className="text-2xl font-semibold">
          Welcome, {userData?.fullName || userData?.username || "Guest"}!
        </h2>
      </div>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 space-y-8">

          {/* Total Votes and Winner */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Total Votes Casted</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-5xl font-bold py-6">
              {totalVotes}
            </CardContent>

            {winner && (
              <div className="flex flex-col items-center bg-green-100 p-4 rounded-lg shadow-lg mt-6">
                {winner.winner.image && (
                  <img
                    src={`data:image/png;base64,${winner.winner.image}`}
                    alt="Winner"
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-green-700">{winner.winner.fullName}</h2>
                <p className="text-green-600">Total Votes: {winner.maxVotes}</p>
                <p className="text-green-600">Total Candidates: {winner.totalCandidates}</p>
                <p className="text-green-600">Total Votes Casted: {winner.totalVotes}</p>
              </div>
            )}
          </Card>

          {/* Elections List */}
          {userData?.role?.toLowerCase() === "voter" && elections.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-center mt-10">Vote for Candidates</h2>
              {elections.map((election, idx) => (
                <Card key={idx} className="mb-6 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-teal-700">{election.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {election.candidates.length === 0 ? (
                      <p className="text-gray-600 italic text-center">
                        No candidates available for this election.
                      </p>
                    ) : (
                      election.candidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-100 rounded shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            {candidate.image && (
                              <img
                                src={`data:image/png;base64,${candidate.image}`}
                                alt="Candidate"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-700">{candidate.fullName}</p>
                              <p className="text-gray-500 text-sm">DID: {candidate.did}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => castVote(election.electionId, candidate.did)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Vote
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center text-gray-600 text-lg mt-10">
              No running elections available for voting.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VoterDashboard;

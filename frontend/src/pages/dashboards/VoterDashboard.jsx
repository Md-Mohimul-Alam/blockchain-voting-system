import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import API from "@/services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const VoterDashboard = () => {
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [elections, setElections] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintContent, setComplaintContent] = useState("");
  const [candidateProfile, setCandidateProfile] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setUserData(JSON.parse(user));
  }, []);

  useEffect(() => {
    if (!userData) return;

    const fetchCandidateProfile = async () => {
      try {
        const res = await API.get(`/candidate/${userData.did}`);
        setCandidateProfile({ status: "approved", ...res.data });
      } catch (err) {
        console.error("Error fetching candidate profile:", err); // Log the error
        // Fallback: check if user applied but not yet approved
        try {
          const apps = await API.get(`/candidacy/list`);
          const userApp = apps.data.find(
            (a) => a.did === userData.did
          );
          if (userApp) setCandidateProfile(userApp); // pending or rejected
          else setCandidateProfile(null); // not applied yet
        } catch (e) {
          console.error("Error checking candidacy status", e);
          setCandidateProfile(null);
        }
      }            
    };

    fetchCandidateProfile();
  }, [userData]);

  const fetchRunningElections = useCallback(async () => {
    try {
      const response = await API.get("/elections/running");
      setElections(response.data || []);
    } catch (error) {
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

  const checkElectionResults = useCallback(async () => {
    try {
      const lastVote = JSON.parse(localStorage.getItem("lastVotedElection"));
      const electionId = lastVote?.electionId;
      if (!electionId) return;
      const resultResponse = await API.get(`/vote/result/${electionId}`);
      if (resultResponse.data) {
        const { winner, maxVotes, totalCandidates, totalVotes, electionEndTime,  electionId} = resultResponse.data;
        setWinner({ winner, maxVotes, totalCandidates, totalVotes, electionEndTime, electionId });

      }
    } catch (error) {
      toast({
        title: "Failed to fetch election results",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (userData?.role?.toLowerCase() === "voter") {
      fetchRunningElections();
      fetchTotalVotes();
      checkElectionResults();
    }
  }, [userData, fetchRunningElections, fetchTotalVotes, checkElectionResults]);

  const castVote = useCallback(async (electionId, candidateDid) => {
    try {
      const voterDid = userData?.did;
      await API.post("/vote", { electionId, voterDid, candidateDid });
      toast({ title: "Vote casted successfully!", variant: "success" });
      localStorage.setItem("lastVotedElection", JSON.stringify({ electionId, voterDid, candidateDid }));
      fetchRunningElections();
      fetchTotalVotes();
      checkElectionResults();
    } catch (error) {
      toast({
        title: "Failed to cast vote",
        description: error.response?.data?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }, [userData, toast, fetchRunningElections, fetchTotalVotes]);

  const handleSubmitComplaint = async () => {
    try {
      await API.post("/complaint", { did: userData.did, content: complaintContent });
      toast({ title: "Complaint submitted successfully!", variant: "success" });
      setComplaintContent("");
      setShowComplaintForm(false);
    } catch (error) {
      toast({
        title: "Failed to submit complaint",
        description: error.response?.data?.message || "Error occurred",
        variant: "destructive",
      });
    }
  };

  const applyForCandidacy = async (electionId) => {
    try {
      await API.post("/candidacy/apply", {
        electionId,
        did: userData.did,
        fullName: userData.fullName,
        dob: userData.dob,
        birthplace: userData.birthplace,
        username: userData.username,
        image: userData.image || "", // optional fallback
        role: "candidate", // ✅ include role
      });
      
  
      toast({ title: "Applied for candidacy successfully!", variant: "success" });
  
      // Refresh candidate profile (could be pending)
      try {
        const updated = await API.get(`/candidate/${userData.did}`);
        setCandidateProfile({ status: "approved", ...updated.data });
      } catch {
        const apps = await API.get(`/candidacy/list`);
        const userApp = apps.data.find((a) => a.did === userData.did);
        if (userApp) setCandidateProfile(userApp);
      }
    } catch (error) {
      toast({
        title: "Failed to apply",
        description: error.response?.data?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="pt-8 pb-8 bg-teal-800 text-white text-center shadow-xl">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-green-500 to-teal-500 text-transparent bg-clip-text">
            {userData?.role || "User"}
          </span> Dashboard
        </h1>
        <h2 className="text-2xl font-semibold">Welcome, {userData?.fullName || userData?.username || "Guest"}!</h2>
      </div>

      <main className="flex-grow">
        <div className="w-full">
        {winner && winner.totalCandidates > 0 && (
        <Card className="bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Total Votes Casted in this Election</CardTitle>
          </CardHeader>

          <CardContent className="text-center text-5xl font-bold py-4">
            {totalVotes}
          </CardContent>

          <div className="flex flex-col items-center bg-white text-gray-800 rounded-b-lg px-6 py-8">
            {winner.winner.image && (
              <img
                src={`data:image/png;base64,${winner.winner.image}`}
                alt="Winner"
                className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-teal-500"
              />
            )}

            <h2 className="text-2xl font-bold text-teal-700 mb-2">{winner.winner.fullName}</h2>
            <p className="text-sm text-gray-600 mb-1">
              DID: <span className="font-medium">{winner.winner.did}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Election ID: <span className="font-medium">{winner.winner.electionId}</span>
            </p>

            {/* ✅ Only show "🎉 Winner" if the election has ended */}
            {winner.electionEndTime &&
              new Date(winner.electionEndTime) < new Date() && (
                <p className="text-lg font-semibold text-green-600 mb-1">
                  🎉 Winner: {winner.winner.fullName}
                </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-center">
              <div>
                <p className="text-gray-500 text-sm">Votes Received</p>
                <p className="text-xl font-bold text-green-700">{winner.maxVotes}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Candidates</p>
                <p className="text-xl font-bold text-green-700">{winner.totalCandidates}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-sm">Total Votes Casted</p>
                <p className="text-xl font-bold text-green-700">{winner.totalVotes}</p>
              </div>
            </div>
          </div>
        </Card>
      )}




          {/* Candidacy Section */}
          <section className="max-w-4xl mx-auto px-4 mt-10 mb-12">
            <h2 className="text-2xl font-bold mb-4">Apply for Candidacy</h2>
            {candidateProfile?.status === "approved" && (
              <Card className="p-4 mb-4 bg-green-50 border border-green-400">
                <CardContent>
                  <p className="text-green-700 font-semibold">✅ You are an approved candidate.</p>
                </CardContent>
              </Card>
            )}
            {candidateProfile?.status === "pending" && (
              <Card className="p-4 mb-4 bg-yellow-50 border border-yellow-400">
                <CardContent>
                  <p className="text-yellow-700 font-semibold">⏳ Your application is pending approval.</p>
                </CardContent>
              </Card>
            )}
            {!candidateProfile && elections.length > 0 && (
              <>
                <p className="mb-4 text-gray-600">You are not a candidate yet. You can apply below:</p>
                {elections.map((election) => (
                  <Card key={election.electionId} className="mb-4 border border-indigo-300">
                    <CardHeader>
                      <CardTitle>{election.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{election.description}</p>
                      <Button
                        onClick={() => applyForCandidacy(election.electionId)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Apply for Candidacy
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </section>

          {/* Voting Section */}
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
                      <p className="text-gray-600 italic text-center">No candidates available for this election.</p>
                    ) : (
                      election.candidates.map((candidate, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded shadow-sm">
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
                          <Button onClick={() => castVote(election.electionId, candidate.did)} className="bg-teal-600 hover:bg-teal-700 text-white">
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
            <div className="text-center text-gray-600 text-lg mt-10">No running elections available for voting.</div>
          )}
        </div>

        {/* Complaint Button */}
        <div className="text-center mt-10 mb-10">
          <Button onClick={() => setShowComplaintForm(!showComplaintForm)} className="bg-red-600 hover:bg-red-700 text-white">
            {showComplaintForm ? "Cancel" : "Submit Complaint"}
          </Button>
        </div>

        {/* Complaint Form */}
        {showComplaintForm && (
          <div className="bg-white rounded shadow-md p-6 mt-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Submit a Complaint</h2>
            <Textarea
              placeholder="Write your complaint here..."
              value={complaintContent}
              onChange={(e) => setComplaintContent(e.target.value)}
              className="w-full mb-4"
            />
            <Button onClick={handleSubmitComplaint} className="bg-red-600 hover:bg-red-700 text-white">
              Submit
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VoterDashboard;

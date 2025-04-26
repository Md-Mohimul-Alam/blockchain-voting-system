import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "@/services/api";

const CandidateDashboard = () => {
  const { toast } = useToast();
  const [elections, setElections] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await API.get("/elections");
        setElections(response.data);
      } catch (error) {
        toast({ title: "Failed to fetch elections", variant: "destructive" });
      }
    };

    const fetchCandidateProfile = async () => {
      try {
        const response = await API.get(`/candidate/${localStorage.getItem("userId")}`);
        setCandidateProfile(response.data);
      } catch (error) {
        toast({ title: "Failed to fetch profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
    fetchCandidateProfile();
  }, []);

  // Filter elections that are upcoming or running
  const filterElections = (elections) => {
    const now = new Date();

    return elections.filter((election) => {
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);

      // Check if the election is upcoming or running
      return startDate > now || (startDate <= now && endDate >= now);
    });
  };

  // Function to apply for candidacy in a specific election
  const applyForCandidacy = async (electionId) => {
    try {
      const response = await API.post('/candidacy/apply', { electionId });
      if (response.status === 200) {
        toast({ title: "Applied for candidacy", variant: "success" });
      }
    } catch (error) {
      toast({ title: "Failed to apply for candidacy", variant: "destructive" });
      console.error("Error applying for candidacy:", error);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-8 text-3xl font-bold text-center text-white bg-teal-800 shadow-xl mb-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-white">
          <span className="capitalize bg-gradient-to-r from-purple-500 to-teal-500 text-transparent bg-clip-text">
            {userData?.role}
          </span>{" "} Control Panel
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-10 text-White">
          Welcome, {userData?.fullName || userData?.username}!!!!
        </h2>
      </div>

      <h2 className="text-3xl font-semibold text-center mb-4">Available Elections</h2>

      {/* Candidate Profile Section - Only show when candidate is approved */}
      {candidateProfile?.isApproved ? (
        <Card className="max-w-xl mx-auto p-8">
          <h3 className="text-xl font-semibold mb-4">Your Profile</h3>
          <p><strong>Name:</strong> {candidateProfile?.name}</p>
          <p><strong>Election:</strong> {candidateProfile?.electionTitle}</p>
          <p><strong>Votes:</strong> {candidateProfile?.votesCount}</p>
          <p><strong>Status:</strong> {candidateProfile?.isApproved ? "Approved" : "Pending"}</p>
        </Card>
      ) : (
        <p className="text-center text-lg text-gray-500">Your candidacy is still pending approval.</p>
      )}

      {/* Elections Section */}
      {filterElections(elections).length === 0 ? (
        <p className="text-center text-lg text-gray-500">No upcoming or running elections available.</p>
      ) : (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {filterElections(elections).map((election) => (
            <Card key={election.electionId} className="mt-8 border-t-4 border-teal-500">
              <CardHeader>
                <CardTitle>{election.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{election.description}</p>
                <Button
                  onClick={() => applyForCandidacy(election.electionId)}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  Apply for Candidacy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CandidateDashboard;

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

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch Elections + Candidate Profile
  useEffect(() => {
    if (!userData) return;

    const fetchAllData = async () => {
      try {
        const [electionsResponse, profileResponse] = await Promise.all([
          API.get("/elections"),
          API.get(`/candidate/${userData.did}`).catch(() => null) // If profile doesn't exist
        ]);
        setElections(electionsResponse.data);
        if (profileResponse) setCandidateProfile(profileResponse.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({ title: "Failed to load dashboard data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userData, toast]);

  // Apply for Candidacy
  const applyForCandidacy = async (electionId) => {
    try {
      await API.post('/candidacy/apply', {
        electionId,
        did: userData.did,
        role: "candidate", // Force role as candidate
        fullName: userData.fullName || `AutoRegistered-${userData.did}`,
        dob: userData.dob || "2000-01-01",
        birthplace: userData.birthplace || "Unknown",
        username: userData.username || `user-${userData.did}`,
        image: userData.image || "", // Optional fallback
      });
  
      toast({ title: "Applied for candidacy successfully!", variant: "success" });
  
      // Refresh candidate profile
      const updatedProfile = await API.get(`/candidate/${userData.did}`);
      setCandidateProfile(updatedProfile.data);
    } catch (error) {
      toast({
        title: "Failed to apply",
        description: error.response?.data?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };
  

  // Categorize Elections
  const categorizeElections = (elections) => {
    const now = new Date();
    const running = [];
    const upcoming = [];

    elections.forEach(election => {
      const start = new Date(election.startDate);
      const end = new Date(election.endDate);
      if (start <= now && end >= now) running.push(election);
      else if (start > now) upcoming.push(election);
    });

    return { running, upcoming };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading Dashboard...</span>
      </div>
    );
  }

  const { running, upcoming } = categorizeElections(elections);

  return (
    <div>
      <Header />

      {/* Dashboard Header */}
      <div className="p-8 bg-gradient-to-r from-teal-700 to-teal-500 text-white text-center shadow-md mb-8">
        <h1 className="text-4xl font-bold mb-2 capitalize">{userData?.role} Dashboard</h1>
        <p className="text-lg">Welcome, {userData?.fullName || userData?.username}!</p>
      </div>

      {/* Candidate Profile Section */}
      {candidateProfile?.status === "approved" && (
        <Card className="max-w-2xl mx-auto p-6 mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Your Candidate Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {candidateProfile.fullName || "N/A"}</p>
            <p><strong>Status:</strong> Approved</p>
          </CardContent>
        </Card>
      )}

      {candidateProfile?.status === "pending" && (
        <div className="text-center text-yellow-500 text-lg mb-8">
          Your candidacy application is pending approval.
        </div>
      )}

      {/* Running Elections */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <h2 className="text-3xl font-bold mb-6">Running Elections</h2>
        {running.length ? running.map((election) => (
          <Card key={election.electionId} className="mb-6 shadow-md border- bg-white border-indigo-600">
            <CardHeader>
              <CardTitle className="text-xl text-teal-700">{election.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{election.description}</p>
              <Button
                disabled={candidateProfile?.status === "pending" || candidateProfile?.status === "approved"}
                onClick={() => applyForCandidacy(election.electionId)}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {candidateProfile?.status === "pending" ? "Application Pending"
                  : candidateProfile?.status === "approved" ? "Already a Candidate"
                  : "Apply for Candidacy"}
              </Button>
            </CardContent>
          </Card>
        )) : (
          <p className="text-center text-gray-600">No running elections currently available.</p>
        )}
      </section>

      {/* Upcoming Elections */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold mb-6">Upcoming Elections</h2>
        {upcoming.length ? upcoming.map((election) => (
          <Card key={election.electionId} className="mb-6 bg-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">{election.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{election.description}</p>
              <p className="text-sm text-gray-500">Starts on: {new Date(election.startDate).toLocaleString()}</p>
            </CardContent>
          </Card>
        )) : (
          <p className="text-center text-gray-600">No upcoming elections found.</p>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default CandidateDashboard;

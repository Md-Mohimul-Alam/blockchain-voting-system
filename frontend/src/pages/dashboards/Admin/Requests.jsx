import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import API from "@/services/api";

const Requests = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await API.get("/candidacy/list");
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Failed to fetch applications",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const approveCandidacy = async (electionId, did) => {
    if (!electionId || !did) {
      toast({ title: "Election ID and Candidate DID are required.", variant: "destructive" });
      return;
    }
    if (!window.confirm(`Are you sure you want to APPROVE DID: ${did}?`)) return;
    try {
      await API.post("/candidacy/approve", { electionId, did });
      toast({ title: "Candidacy approved successfully!", variant: "success" });
      fetchApplications();
    } catch (error) {
      console.error("Error approving candidacy:", error);
      toast({
        title: "Approval failed",
        description: error.response?.data?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const rejectCandidacy = async (electionId, did) => {
    if (!electionId || !did) {
      toast({ title: "Election ID and Candidate DID are required.", variant: "destructive" });
      return;
    }
    if (!window.confirm(`Are you sure you want to REJECT DID: ${did}?`)) return;
    try {
      await API.post("/candidacy/reject", { electionId, did });
      toast({ title: "Candidacy rejected successfully!", variant: "success" });
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting candidacy:", error);
      toast({
        title: "Rejection failed",
        description: error.response?.data?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-600">Loading candidacy requests...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6 bg-teal-700 text-white text-center font-bold text-3xl">
        Candidacy Approval Panel
      </div>

      {applications.length === 0 ? (
        <div className="text-center text-lg text-gray-500 mt-10">
          No pending candidacy applications found.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {applications.map((app, idx) => (
            <Card key={idx} className="border-t-4 border-indigo-500 shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-indigo-600 text-lg">
                  {app.did ? `Candidate DID: ${app.did}` : "No DID"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Election ID:</strong> {app.electionId || "Unknown"}</p>
                <p><strong>Status:</strong> {app.status}</p>
                <p><strong>Applied At:</strong> {new Date(app.appliedAt).toLocaleString()}</p>

                {app.status === "pending" && (
                  <div className="flex gap-4 mt-4">
                    <Button
                      onClick={() => approveCandidacy(app.electionId, app.did)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectCandidacy(app.electionId, app.did)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Requests;

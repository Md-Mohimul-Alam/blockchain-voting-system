import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserCheck, XCircle, Clock, CheckCircle, AlertCircle, RefreshCw, Users, Award } from "lucide-react";
import API from "@/services/api";

const Requests = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [processingApplications, setProcessingApplications] = useState(new Set());

  // FIXED: Enhanced fetchApplications function
  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      console.log("🔄 Fetching candidate applications...");
      
      let apps = [];
      
      // Try the correct endpoint first
      try {
        const response = await API.get("/candidacy/applications/all");
        apps = response.data?.data || response.data || [];
        console.log("✅ Got applications from /candidacy/applications/all:", apps.length);
      } catch (error) {
        console.log("❌ /candidacy/applications/all failed:", error.message);
        
        // Fallback to pending applications
        try {
          const pendingResponse = await API.get("/candidacy/applications/pending");
          apps = pendingResponse.data?.data || pendingResponse.data || [];
          console.log("✅ Got applications from fallback:", apps.length);
        } catch (fallbackError) {
          console.log("❌ All endpoints failed");
          apps = [];
        }
      }

      setApplications(apps);
      console.log("📥 Final applications data:", apps);

    } catch (error) {
      console.error("❌ Error fetching applications:", error);
      toast({
        title: "Failed to fetch applications",
        description: error.response?.data?.error || "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications based on search and tab
  useEffect(() => {
    let filtered = applications;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(app => app.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.did?.toLowerCase().includes(term) ||
        app.electionId?.toLowerCase().includes(term) ||
        app.fullName?.toLowerCase().includes(term) ||
        app.username?.toLowerCase().includes(term) ||
        (app.electionTitle && app.electionTitle.toLowerCase().includes(term))
      );
    }

    setFilteredApplications(filtered);
  }, [applications, activeTab, searchTerm]);

  // FIXED: Enhanced approveCandidacy function
  const approveCandidacy = async (electionId, did, candidateName = "Candidate") => {
    if (!electionId || !did) {
      toast({ 
        title: "Missing Information", 
        description: "Election ID and Candidate DID are required.",
        variant: "destructive" 
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to APPROVE ${candidateName} (DID: ${did}) for election ${electionId}?`)) return;
    
    const processingKey = `${electionId}-${did}-approve`;
    setProcessingApplications(prev => new Set(prev).add(processingKey));

    try {
      console.log(`✅ Approving candidacy: ${electionId}, ${did}`);
      
      const response = await API.post("/candidacy/approve", { 
        electionId: electionId.toString(), 
        did: did.toString() 
      });
      
      console.log("✅ Approval response:", response.data);

      if (response.data.success) {
        toast({ 
          title: "✅ Candidacy Approved!", 
          description: `${candidateName} has been approved successfully. They can now login as a candidate.`,
          variant: "success" 
        });
        
        // Refresh the applications list
        await fetchApplications();
      } else {
        throw new Error(response.data.error || "Approval failed");
      }
      
    } catch (error) {
      console.error("❌ Error approving candidacy:", error);
      
      let errorMessage = "Failed to approve candidacy";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message.includes('already approved')) {
        errorMessage = "Candidacy is already approved";
      } else if (error.message.includes('not found')) {
        errorMessage = "Application not found";
      } else if (error.message.includes('Peer endorsements do not match')) {
        errorMessage = "Blockchain network issue. Please try again.";
      }

      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(processingKey);
        return newSet;
      });
    }
  };

  // FIXED: Enhanced rejectCandidacy function
  const rejectCandidacy = async (electionId, did, candidateName = "Candidate") => {
    if (!electionId || !did) {
      toast({ 
        title: "Missing Information",
        description: "Election ID and Candidate DID are required.",
        variant: "destructive" 
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to REJECT ${candidateName} (DID: ${did}) for election ${electionId}?`)) return;
    
    const processingKey = `${electionId}-${did}-reject`;
    setProcessingApplications(prev => new Set(prev).add(processingKey));

    try {
      console.log(`❌ Rejecting candidacy: ${electionId}, ${did}`);
      
      const response = await API.post("/candidacy/reject", { 
        electionId: electionId.toString(), 
        did: did.toString() 
      });
      
      console.log("✅ Rejection response:", response.data);

      if (response.data.success) {
        toast({ 
          title: "❌ Candidacy Rejected", 
          description: `${candidateName} has been rejected.`,
          variant: "default" 
        });
        
        await fetchApplications();
      } else {
        throw new Error(response.data.error || "Rejection failed");
      }
      
    } catch (error) {
      console.error("❌ Error rejecting candidacy:", error);
      
      let errorMessage = "Failed to reject candidacy";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message.includes('already rejected')) {
        errorMessage = "Candidacy is already rejected";
      } else if (error.message.includes('not found')) {
        errorMessage = "Application not found";
      }

      toast({
        title: "Rejection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(processingKey);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      withdrawn: "outline"
    };

    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
      withdrawn: <AlertCircle className="w-3 h-3 mr-1" />
    };

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const getStats = () => {
    const stats = {
      all: applications.length,
      pending: applications.filter(app => app.status === "pending").length,
      approved: applications.filter(app => app.status === "approved").length,
      rejected: applications.filter(app => app.status === "rejected").length
    };
    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Loading Candidacy Requests...</h2>
            <p className="text-gray-500 mt-2">Please wait while we fetch the applications</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-indigo-700 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold mb-3 flex items-center justify-center lg:justify-start gap-3">
                <Award className="w-10 h-10" />
                Candidacy Approval Panel
              </h1>
              <p className="text-xl opacity-90 max-w-2xl">
                Review and manage candidate applications for elections
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={fetchApplications}
                disabled={refreshing}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-6 -mt-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-full">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-teal-700">{stats.all}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 pb-12">
        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by DID, Election ID, or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList className="grid grid-cols-5 w-full lg:w-auto">
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    All ({stats.all})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending ({stats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Approved ({stats.approved})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Rejected ({stats.rejected})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <Card className="text-center py-12 shadow-sm">
            <CardContent>
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {applications.length === 0 ? "No Applications Found" : "No Matching Applications"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {applications.length === 0 
                  ? "There are no candidacy applications to review at this time." 
                  : "No applications match your current search criteria. Try adjusting your filters."}
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm("")} 
                  variant="outline" 
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map((app, idx) => {
              const isProcessing = processingApplications.has(`${app.electionId}-${app.did}-approve`) || 
                                 processingApplications.has(`${app.electionId}-${app.did}-reject`);
              
              return (
                <Card 
                  key={app.applicationId || `${app.electionId}-${app.did}-${idx}`} 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-teal-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {app.fullName || `Candidate ${app.did?.substring(0, 8)}...`}
                      </CardTitle>
                      {getStatusBadge(app.status)}
                    </div>
                    <CardDescription className="text-sm">
                      {app.username && `@${app.username}`}
                      {app.username && app.did && " • "}
                      {app.did && `DID: ${app.did.substring(0, 16)}...`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Election ID:</span>
                        <span className="font-medium">{app.electionId || "Unknown"}</span>
                      </div>
                      
                      {app.birthplace && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Birthplace:</span>
                          <span className="font-medium">{app.birthplace}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applied:</span>
                        <span className="font-medium">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Unknown"}
                        </span>
                      </div>
                      
                      {app.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approved:</span>
                          <span className="font-medium">{new Date(app.approvedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {app.status === "pending" && (
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          onClick={() => approveCandidacy(app.electionId, app.did, app.fullName)}
                          disabled={isProcessing}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          {processingApplications.has(`${app.electionId}-${app.did}-approve`) ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectCandidacy(app.electionId, app.did, app.fullName)}
                          disabled={isProcessing}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          {processingApplications.has(`${app.electionId}-${app.did}-reject`) ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}

                    {app.status === "approved" && (
                      <div className="pt-3 border-t">
                        <Badge variant="default" className="w-full justify-center bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved Candidate
                        </Badge>
                        <p className="text-xs text-green-600 mt-1 text-center">
                          Candidate can login with their credentials
                        </p>
                      </div>
                    )}

                    {app.status === "rejected" && (
                      <div className="pt-3 border-t">
                        <Badge variant="destructive" className="w-full justify-center">
                          <XCircle className="w-3 h-3 mr-1" />
                          Application Rejected
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {filteredApplications.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Requests;
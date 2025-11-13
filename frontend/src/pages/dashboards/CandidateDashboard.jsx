import React, { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useToast } from "../../hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import { 
  Calendar, 
  Vote, 
  UserCheck, 
  Clock, 
  Award, 
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import API from "../../services/api";

const CandidateDashboard = () => {
  const { toast } = useToast();
  const [elections, setElections] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [applyingElections, setApplyingElections] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [previousApplications, setPreviousApplications] = useState([]);

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        console.log("✅ User data loaded:", user);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch All Data
  const fetchAllData = async () => {
    if (!userData) return;

    try {
      setLoading(true);
      console.log("🔄 Fetching dashboard data...");
      
      const [electionsResponse, applicationsResponse] = await Promise.all([
        API.get("/elections"),
        API.get("/candidate/applications").catch(() => ({ data: { data: [] } }))
      ]);

      console.log("📊 Elections response:", electionsResponse.data);
      console.log("📝 Applications response:", applicationsResponse.data);

      // Handle different response formats
      const electionsData = electionsResponse.data.data || electionsResponse.data || [];
      const applicationsData = applicationsResponse.data.data || applicationsResponse.data || [];

      // Filter applications to only show current user's applications
      const userApplications = Array.isArray(applicationsData) 
        ? applicationsData.filter(app => app.did === userData.did)
        : [];

      setElections(Array.isArray(electionsData) ? electionsData : []);
      setApplications(userApplications);

      console.log(`✅ Loaded ${electionsData.length} elections and ${userApplications.length} applications for user ${userData.did}`);

    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      toast({
        title: "Failed to load dashboard data",
        description: error.response?.data?.error || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchAllData();
    }
  }, [userData]);

  // Real-time status polling for applications
  useEffect(() => {
    if (applications.length === 0) return;

    // Check if any applications are pending
    const pendingApplications = applications.filter(app => app.status === 'pending');
    if (pendingApplications.length === 0) return;

    // Set up interval to check for status updates
    const intervalId = setInterval(() => {
      console.log("🔄 Checking for application status updates...");
      fetchAllData();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [applications]);

  // Effect to detect application status changes
  useEffect(() => {
    if (previousApplications.length === 0) {
      setPreviousApplications(applications);
      return;
    }

    // Check for status changes
    applications.forEach(currentApp => {
      const previousApp = previousApplications.find(prev => 
        prev.applicationId === currentApp.applicationId || 
        (prev.electionId === currentApp.electionId && prev.did === currentApp.did)
      );

      if (previousApp && previousApp.status !== currentApp.status) {
        // Status changed - show notification
        const electionTitle = getElectionTitle(currentApp.electionId);
        
        if (currentApp.status === 'approved') {
          toast({
            title: "🎉 Candidacy Approved!",
            description: `Your application for "${electionTitle}" has been approved! You are now an official candidate.`,
            variant: "success",
            duration: 5000,
          });
        } else if (currentApp.status === 'rejected') {
          toast({
            title: "Application Status Update",
            description: `Your application for "${electionTitle}" was not approved.`,
            variant: "destructive",
          });
        }
      }
    });

    setPreviousApplications(applications);
  }, [applications]);

  // Refresh data manually
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchAllData();
      toast({
        title: "Data Refreshed",
        description: "Latest application status has been loaded",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not update application status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Apply for Candidacy - ENHANCED VERSION
  const applyForCandidacy = async (electionId, electionTitle) => {
    if (!userData?.did) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    // Enhanced duplicate check
    const existingApplication = applications.find(app => 
      app.electionId === electionId.toString() && app.did === userData.did
    );

    if (existingApplication) {
      toast({
        title: "Already Applied",
        description: `You have already applied for "${electionTitle}". Current status: ${existingApplication.status || 'pending'}`,
        variant: "default",
      });
      return;
    }

    // Prevent multiple simultaneous applications
    if (applyingElections.has(electionId)) {
      return;
    }

    setApplyingElections(prev => new Set(prev).add(electionId));

    try {
      const applicationData = {
        electionId: electionId.toString(),
        did: userData.did.toString(),
        role: "candidate",
        fullName: userData.fullName || `Candidate-${userData.did.substring(0, 8)}`,
        dob: userData.dob || "2000-01-01",
        birthplace: userData.birthplace || "Not specified",
        username: userData.username || `user-${userData.did.substring(0, 8)}`,
      };

      console.log("📤 Submitting application:", applicationData);

      const response = await API.post('/candidacy/apply', applicationData);
      console.log("✅ Application API response:", response.data);

      if (response.data.success) {
        toast({
          title: "🎉 Application Submitted!",
          description: `You've successfully applied for "${electionTitle}". Your application is pending review.`,
          variant: "success",
        });

        // IMMEDIATELY update local state to show pending status
        const newApplication = {
          ...applicationData,
          status: "pending",
          appliedAt: new Date().toISOString(),
          applicationId: `${electionId}-${userData.did}-${Date.now()}`
        };

        setApplications(prev => [...prev, newApplication]);
        
        // Also refresh to get the official application from backend
        setTimeout(() => {
          fetchAllData();
        }, 1000);

      } else {
        throw new Error(response.data.error || "Application failed");
      }

    } catch (error) {
      console.error("❌ Application error:", error);
      
      let errorMessage = "Unable to submit application";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message.includes('already applied') || error.response?.data?.details?.includes('already applied')) {
        errorMessage = "You have already applied for this election. Please check your applications tab.";
        // Force refresh to get current state
        await fetchAllData();
      } else if (error.message.includes('not found')) {
        errorMessage = "Election not found";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Request timeout. Please try again.";
      }

      toast({
        title: "Application Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setApplyingElections(prev => {
        const newSet = new Set(prev);
        newSet.delete(electionId);
        return newSet;
      });
    }
  };

  // Withdraw Application
  const withdrawApplication = async (electionId, electionTitle) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${electionTitle}"?`)) {
      return;
    }

    try {
      console.log("🗑️ Withdrawing application for election:", electionId);
      
      const response = await API.post('/candidacy/withdraw', { 
        electionId: electionId.toString(), 
        did: userData?.did.toString() 
      });

      console.log("✅ Withdrawal response:", response.data);

      if (response.data.success) {
        toast({
          title: "Application Withdrawn",
          description: `You've withdrawn from "${electionTitle}"`,
          variant: "default",
        });

        // Remove from local state immediately
        setApplications(prev => 
          prev.filter(app => !(app.electionId === electionId.toString() && app.did === userData?.did))
        );

      } else {
        throw new Error(response.data.error || "Withdrawal failed");
      }

    } catch (error) {
      console.error("❌ Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: error.response?.data?.error || "Unable to withdraw application",
        variant: "destructive",
      });
    }
  };

  // Categorize Elections
  const categorizeElections = (elections) => {
    const now = new Date();
    const running = [];
    const upcoming = [];
    const ended = [];

    elections.forEach(election => {
      if (!election.startDate || !election.endDate) return;
      
      const start = new Date(election.startDate);
      const end = new Date(election.endDate);
      
      if (start <= now && end >= now) {
        running.push(election);
      } else if (start > now) {
        upcoming.push(election);
      } else {
        ended.push(election);
      }
    });

    return { running, upcoming, ended };
  };

  // Get application status for election
  const getApplicationStatus = (electionId) => {
    const application = applications.find(app => 
      app.electionId === electionId.toString() && app.did === userData?.did
    );
    return application ? application.status : null;
  };

  // Get application object for election
  const getApplication = (electionId) => {
    return applications.find(app => 
      app.electionId === electionId.toString() && app.did === userData?.did
    );
  };

  // Get election title by ID
  const getElectionTitle = (electionId) => {
    const election = elections.find(e => e.electionId === electionId);
    return election ? election.title : `Election ${electionId}`;
  };

  // Debug function
  const debugCurrentState = () => {
    console.log("=== CURRENT STATE DEBUG ===");
    console.log("User:", userData);
    console.log("Elections:", elections.length);
    console.log("Applications:", applications);
    console.log("Applying Elections:", Array.from(applyingElections));
    console.log("===========================");
  };

  // Loading Skeleton
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { running, upcoming, ended } = categorizeElections(elections);
  const approvedElections = applications.filter(app => app.status === "approved").length;
  const pendingApplications = applications.filter(app => app.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />

      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Award className="w-8 h-8" />
                Candidate Dashboard
              </h1>
              <p className="text-xl opacity-90">
                Welcome back, <span className="font-semibold">{userData?.fullName || userData?.username || "Candidate"}</span>
              </p>
              <p className="opacity-80 mt-1">Manage your candidacy and track election progress</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/20 backdrop-blur-sm">
                {userData?.role || "Candidate"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-6 -mt-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-full">
                <UserCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved Candidacies</p>
                <p className="text-2xl font-bold text-teal-700">{approvedElections}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-blue-700">{pendingApplications}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Elections</p>
                <p className="text-2xl font-bold text-orange-700">{running.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="elections" className="flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Elections
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Applications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <Award className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setActiveTab("elections")}
                    className="bg-teal-600 hover:bg-teal-700 text-white h-12"
                  >
                    <Vote className="w-4 h-4 mr-2" />
                    Browse Elections
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("applications")}
                    variant="outline"
                    className="h-12 border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    View Applications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Running Elections Preview */}
            {running.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <TrendingUp className="w-5 h-5" />
                    Active Elections ({running.length})
                  </CardTitle>
                  <CardDescription>Elections currently in progress where you can apply</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {running.slice(0, 3).map((election) => {
                      const applicationStatus = getApplicationStatus(election.electionId);
                      const isApplying = applyingElections.has(election.electionId);
                      
                      return (
                        <div key={election.electionId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold">{election.title}</h4>
                            <p className="text-sm text-gray-600">{election.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={
                                applicationStatus === 'approved' ? 'default' :
                                applicationStatus === 'pending' ? 'secondary' : 'outline'
                              } className={
                                applicationStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }>
                                {applicationStatus === 'approved' ? '✅ Approved' :
                                applicationStatus === 'pending' ? '⏳ Pending Review' :
                                '📝 Not Applied'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Ends: {new Date(election.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {!applicationStatus && (
                            <Button
                              onClick={() => applyForCandidacy(election.electionId, election.title)}
                              disabled={isApplying}
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700 text-white"
                            >
                              {isApplying ? (
                                <>
                                  <Clock className="w-4 h-4 mr-1 animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Apply
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Applications Preview */}
            {applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <UserCheck className="w-5 h-5" />
                    Recent Applications ({applications.length})
                  </CardTitle>
                  <CardDescription>Your recent candidacy applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((application) => (
                      <div key={application.applicationId || `${application.electionId}-${application.did}`} 
                           className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{getElectionTitle(application.electionId)}</p>
                          <p className="text-sm text-gray-600">
                            Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        <Badge variant={
                          application.status === 'approved' ? 'default' :
                          application.status === 'rejected' ? 'destructive' : 'secondary'
                        } className={
                          application.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }>
                          <div className="flex items-center gap-1">
                            {application.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {application.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {application.status === 'pending' && <Clock className="w-3 h-3" />}
                            {application.status?.toUpperCase() || 'PENDING'}
                          </div>
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {applications.length > 3 && (
                    <Button 
                      onClick={() => setActiveTab("applications")}
                      variant="outline" 
                      className="w-full mt-4"
                    >
                      View All Applications
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Elections Tab */}
          <TabsContent value="elections" className="space-y-6">
            {/* Running Elections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  Active Elections ({running.length})
                </CardTitle>
                <CardDescription>Apply for candidacy in currently running elections</CardDescription>
              </CardHeader>
              <CardContent>
                {running.length > 0 ? (
                  <div className="grid gap-4">
                    {running.map((election) => {
                      const applicationStatus = getApplicationStatus(election.electionId);
                      const application = getApplication(election.electionId);
                      const isApplying = applyingElections.has(election.electionId);

                      return (
                        <Card key={election.electionId} className="border-l-4 border-l-green-500">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {election.title}
                                </h3>
                                <p className="text-gray-600 mb-3">{election.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Ends: {new Date(election.endDate).toLocaleDateString()}
                                  </div>
                                  <Badge variant={
                                    applicationStatus === 'approved' ? 'default' :
                                    applicationStatus === 'pending' ? 'secondary' : 
                                    applicationStatus === 'rejected' ? 'destructive' : 'outline'
                                  } className={
                                    applicationStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                    applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    applicationStatus === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                  }>
                                    {applicationStatus === 'approved' ? '✅ Approved Candidate' :
                                    applicationStatus === 'pending' ? '⏳ Application Pending' :
                                    applicationStatus === 'rejected' ? '❌ Application Rejected' :
                                    '📝 Not Applied'}
                                  </Badge>
                                  {application?.appliedAt && (
                                    <span className="text-xs">
                                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                {(() => {
                                  if (applicationStatus === 'approved') {
                                    return (
                                      <Button className="bg-green-600 text-white" disabled>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approved
                                      </Button>
                                    );
                                  } else if (applicationStatus === 'pending') {
                                    return (
                                      <>
                                        <Button className="bg-yellow-600 text-white" disabled>
                                          <Clock className="w-4 h-4 mr-2" />
                                          Pending
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => withdrawApplication(election.electionId, election.title)}
                                          className="text-red-600 border-red-300 hover:bg-red-50"
                                          size="sm"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Withdraw
                                        </Button>
                                      </>
                                    );
                                  } else if (applicationStatus === 'rejected') {
                                    return (
                                      <Button className="bg-red-600 text-white" disabled>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Rejected
                                      </Button>
                                    );
                                  } else {
                                    return (
                                      <Button
                                        onClick={() => applyForCandidacy(election.electionId, election.title)}
                                        disabled={isApplying}
                                        className="bg-teal-600 hover:bg-teal-700 text-white"
                                      >
                                        {isApplying ? (
                                          <>
                                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                                            Applying...
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Apply Now
                                          </>
                                        )}
                                      </Button>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Vote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active elections at the moment</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Elections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Calendar className="w-5 h-5" />
                  Upcoming Elections ({upcoming.length})
                </CardTitle>
                <CardDescription>Elections that will start soon</CardDescription>
              </CardHeader>
              <CardContent>
                {upcoming.length > 0 ? (
                  <div className="grid gap-4">
                    {upcoming.map((election) => (
                      <Card key={election.electionId} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {election.title}
                              </h3>
                              <p className="text-gray-600 mb-3">{election.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Starts: {new Date(election.startDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Coming Soon
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming elections scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <UserCheck className="w-5 h-5" />
                  My Applications ({applications.length})
                </CardTitle>
                <CardDescription>Track your candidacy application status</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application.applicationId || `${application.electionId}-${application.did}`} className="border">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {getElectionTitle(application.electionId)}
                                </h3>
                                <Badge variant={
                                  application.status === 'approved' ? 'default' :
                                  application.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                } className={
                                  application.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }>
                                  <div className="flex items-center gap-1">
                                    {application.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                    {application.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                    {application.status === 'pending' && <Clock className="w-3 h-3" />}
                                    {application.status ? application.status.toUpperCase() : 'PENDING'}
                                  </div>
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Election ID:</strong> {application.electionId}</p>
                                <p><strong>Applied:</strong> {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown date'}</p>
                                {application.approvedAt && (
                                  <p><strong>Approved:</strong> {new Date(application.approvedAt).toLocaleDateString()}</p>
                                )}
                                {application.rejectedAt && (
                                  <p><strong>Rejected:</strong> {new Date(application.rejectedAt).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                            {application.status === 'pending' && (
                              <Button
                                variant="outline"
                                onClick={() => withdrawApplication(application.electionId, getElectionTitle(application.electionId))}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Withdraw
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No applications submitted yet</p>
                    <Button 
                      onClick={() => setActiveTab("elections")}
                      className="mt-4 bg-teal-600 hover:bg-teal-700"
                    >
                      Browse Elections
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Debug Information */}
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">System Information</h4>
              <p className="text-sm text-gray-600">
                User: {userData?.did} | Elections: {elections.length} | Applications: {applications.length}
              </p>
            </div>
            <Button onClick={debugCurrentState} variant="outline" size="sm">
              Debug State
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateDashboard;
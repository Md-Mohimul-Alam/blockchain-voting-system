import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "../../hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { 
  Vote, 
  User, 
  AlertCircle, 
  Trophy, 
  Calendar,
  Users,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  Award,
  Loader2,
  History,
  BarChart3,
  Crown,
  MessageSquare,
  Search,
  Eye,
  Trash2,
  RefreshCw
} from "lucide-react";
import API from "../../services/api";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const VoterDashboard = () => {
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [elections, setElections] = useState([]);
  const [endedElections, setEndedElections] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [latestWinner, setLatestWinner] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintContent, setComplaintContent] = useState("");
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("elections");
  const [loading, setLoading] = useState({
    elections: false,
    endedElections: false,
    votes: false,
    results: false,
    profile: false,
    allResults: false,
    complaints: false
  });

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintDetail, setShowComplaintDetail] = useState(false);
  const [searchComplaintId, setSearchComplaintId] = useState("");

  // Helper function for consistent API response handling
  const handleApiResponse = (response) => {
    return response.data?.data || response.data || [];
  };

  // Improved status determination
  const determineStatus = (complaint) => {
    console.log('🔍 Determining status for complaint:', {
      id: complaint.id,
      backendStatus: complaint.status,
      hasResponse: !!(complaint.response || complaint.responseText || complaint.adminResponse)?.trim(),
      response: complaint.response,
      responseText: complaint.responseText,
      adminResponse: complaint.adminResponse
    });

    // Use backend status if available and valid
    if (complaint.status && ['pending', 'resolved', 'closed'].includes(complaint.status)) {
      console.log('✅ Using backend status:', complaint.status);
      return complaint.status;
    }
    
    // Check for any response content
    const responseText = complaint.response || complaint.responseText || complaint.adminResponse || '';
    const hasResponse = responseText.trim().length > 0;
    
    console.log('📝 Response check:', {
      responseText,
      hasResponse,
      trimmedLength: responseText.trim().length
    });
    
    const status = hasResponse ? 'resolved' : 'pending';
    console.log('🎯 Determined status:', status);
    
    return status;
  };

  // Enhanced processComplaintsData with better debugging
  const processComplaintsData = (complaintsData, userDid) => {
    if (!complaintsData || !Array.isArray(complaintsData)) {
      console.log('❌ No complaints data or invalid format');
      return [];
    }

    console.log(`📊 Processing ${complaintsData.length} complaints`);

    return complaintsData.map((complaint, index) => {
      const complaintId = complaint.id || complaint.key || complaint.complaintId || 
                        `complaint-${Date.now()}-${index}`;
      
      const responseText = complaint.response || complaint.responseText || complaint.adminResponse || '';
      const responseAt = complaint.responseAt || complaint.respondedAt;
      const respondedBy = complaint.respondedBy || complaint.adminDid || 'Admin';
      
      const status = determineStatus(complaint);
      
      const processedComplaint = {
        id: complaintId,
        status: status,
        timestamp: complaint.timestamp || complaint.createdAt || complaint.date,
        response: responseText,
        responseAt: responseAt,
        respondedBy: respondedBy,
        content: complaint.content || complaint.message || complaint.description || "No content",
        did: complaint.did || complaint.userDid || userDid,
        _original: complaint
      };

      console.log(`✅ Processed complaint ${index}:`, {
        id: processedComplaint.id,
        status: processedComplaint.status,
        hasResponse: !!processedComplaint.response?.trim(),
        responseLength: processedComplaint.response?.length || 0
      });

      return processedComplaint;
    });
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch user complaints
    const fetchUserComplaints = useCallback(async () => {
      if (!userData?.did) {
        console.log("No user DID available");
        return;
      }
      
      setLoading(prev => ({ ...prev, complaints: true }));
      
      try {
        let complaintsData = [];
        
        // Try user-specific endpoint first
        try {
          const response = await API.get(`/complaints/user/${userData.did}`);
          complaintsData = response.data?.data || response.data || [];
        } catch (userError) {
          // Fallback: get all and filter
          try {
            const allResponse = await API.get('/complaints');
            const allComplaints = allResponse.data?.data || allResponse.data || [];
            complaintsData = allComplaints.filter(c => 
              (c.did === userData.did) || (c.userDid === userData.did)
            );
          } catch (allError) {
            throw new Error('Could not fetch complaints from any endpoint');
          }
        }
        
        // Process the data
        const processed = processComplaintsData(complaintsData, userData.did);
        setComplaints(processed);
        setFilteredComplaints(processed);
        
        if (processed.length > 0) {
          toast({
            title: "Complaints loaded",
            description: `Found ${processed.length} complaints`,
            variant: "success",
          });
        }
        
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
        toast({
          title: "Failed to load complaints",
          description: error.response?.data?.error || error.message,
          variant: "destructive",
        });
        setComplaints([]);
        setFilteredComplaints([]);
      } finally {
        setLoading(prev => ({ ...prev, complaints: false }));
      }
    }, [userData, toast]);

  // Refresh complaints
  const refreshComplaints = async () => {
    await fetchUserComplaints();
  };

  // Filter complaints based on selected filter
  useEffect(() => {
    let filtered = [...complaints];
    
    if (complaintFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.status === complaintFilter);
    }
    
    if (searchComplaintId.trim()) {
      filtered = filtered.filter(complaint => 
        complaint.id?.toLowerCase().includes(searchComplaintId.toLowerCase()) ||
        complaint.content?.toLowerCase().includes(searchComplaintId.toLowerCase())
      );
    }
    
    setFilteredComplaints(filtered);
  }, [complaints, complaintFilter, searchComplaintId]);

  // Fetch complaints when user data is available and on complaints tab
  useEffect(() => {
    if (userData?.did && activeTab === "complaints") {
      fetchUserComplaints();
    }
  }, [userData, activeTab, fetchUserComplaints]);

  useEffect(() => {
    if (!userData) return;

    const fetchCandidateProfile = async () => {
      setLoading(prev => ({ ...prev, profile: true }));
      try {
        const res = await API.get(`/candidate/${userData.did}`);
        if (res.data.success) {
          setCandidateProfile({ status: "approved", ...res.data.data });
        } else {
          throw new Error("Candidate not found");
        }
      } catch (err) {
        try {
          const apps = await API.get(`/candidacy/applications/all`);
          const applications = handleApiResponse(apps);
          const userApp = applications.find((a) => a.did === userData.did);
          if (userApp) {
            setCandidateProfile(userApp);
          } else {
            setCandidateProfile(null);
          }
        } catch (e) {
          console.error("Error fetching candidate applications:", e);
          setCandidateProfile(null);
        }
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }            
    };

    fetchCandidateProfile();
  }, [userData]);

  const fetchRunningElections = useCallback(async () => {
    setLoading(prev => ({ ...prev, elections: true }));
    try {
      const response = await API.get("/elections/running");
      const electionsData = handleApiResponse(response);
      
      const enhancedElections = await Promise.all(
        electionsData.map(async (election) => {
          try {
            const candidatesResponse = await API.get(`/candidates/approved/${election.electionId}`);
            const candidates = handleApiResponse(candidatesResponse);
            
            return {
              ...election,
              candidates: candidates || [],
              voters: election.voters || [],
              votes: election.votes || []
            };
          } catch (error) {
            console.error(`Error fetching candidates for election ${election.electionId}:`, error);
            return {
              ...election,
              candidates: [],
              voters: election.voters || [],
              votes: election.votes || []
            };
          }
        })
      );
      
      setElections(enhancedElections);
    } catch (error) {
      console.error("Failed to fetch running elections:", error);
      toast({
        title: "Failed to fetch running elections",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
      setElections([]);
    } finally {
      setLoading(prev => ({ ...prev, elections: false }));
    }
  }, [toast]);

  const fetchAllElections = useCallback(async () => {
    try {
      const response = await API.get("/elections");
      return handleApiResponse(response);
    } catch (error) {
      console.error("Failed to fetch all elections:", error);
      return [];
    }
  }, []);

  const fetchEndedElections = useCallback(async () => {
    setLoading(prev => ({ ...prev, endedElections: true }));
    try {
      const allElections = await fetchAllElections();
      
      const ended = allElections.filter(election => {
        if (!election.endDate) return false;
        try {
          const endDate = new Date(election.endDate);
          return endDate < new Date();
        } catch (error) {
          console.error("Error parsing election end date:", error);
          return false;
        }
      });

      const enhancedEndedElections = await Promise.all(
        ended.map(async (election) => {
          try {
            const resultResponse = await API.get(`/election/${election.electionId}`);
            if (resultResponse.data.success && resultResponse.data.data) {
              const electionData = resultResponse.data.data;
              return {
                ...election,
                winnerDeclared: electionData.winnerDeclared || false,
                winner: electionData.winnerDid ? {
                  did: electionData.winnerDid,
                  name: electionData.winnerFullName || "Unknown Candidate"
                } : null,
                hasResults: electionData.winnerDeclared || false
              };
            }
          } catch (error) {
            console.error(`Error fetching results for election ${election.electionId}:`, error);
          }
          
          return {
            ...election,
            winnerDeclared: false,
            winner: null,
            hasResults: false
          };
        })
      );

      setEndedElections(enhancedEndedElections);
    } catch (error) {
      console.error("Failed to fetch ended elections:", error);
      setEndedElections([]);
    } finally {
      setLoading(prev => ({ ...prev, endedElections: false }));
    }
  }, [fetchAllElections]);

  const fetchAllElectionResults = useCallback(async () => {
    setLoading(prev => ({ ...prev, allResults: true }));
    try {
      const allElections = await fetchAllElections();
      
      const resultsWithData = await Promise.all(
        allElections.map(async (election) => {
          try {
            const electionResponse = await API.get(`/election/${election.electionId}`);
            if (electionResponse.data.success && electionResponse.data.data) {
              const electionData = electionResponse.data.data;
              
              const hasEnded = new Date(electionData.endDate) < new Date();
              const hasWinner = electionData.winnerDeclared && electionData.winnerDid;

              if (hasEnded && hasWinner) {
                return {
                  electionId: electionData.electionId,
                  title: electionData.title,
                  description: electionData.description,
                  endDate: electionData.endDate,
                  totalVotes: electionData.votes?.length || 0,
                  totalCandidates: electionData.candidates?.length || 0,
                  winner: {
                    did: electionData.winnerDid,
                    name: electionData.winnerFullName || "Unknown Candidate"
                  },
                  winnerDeclared: true,
                  maxVotes: electionData.maxVotes || 0,
                  hasResults: true
                };
              } else if (hasEnded) {
                try {
                  const voteResultResponse = await API.get(`/vote/result/${election.electionId}`);
                  if (voteResultResponse.data.success && voteResultResponse.data.data?.winnerDid) {
                    const resultData = voteResultResponse.data.data;
                    return {
                      electionId: electionData.electionId,
                      title: electionData.title,
                      description: electionData.description,
                      endDate: electionData.endDate,
                      totalVotes: resultData.totalVotes || 0,
                      totalCandidates: resultData.totalCandidates || 0,
                      winner: {
                        did: resultData.winnerDid,
                        name: resultData.winnerName || "Unknown Candidate"
                      },
                      winnerDeclared: true,
                      maxVotes: resultData.maxVotes || 0,
                      hasResults: true
                    };
                  }
                } catch (voteError) {
                  console.error(`Error fetching vote results for ${election.electionId}:`, voteError);
                }
              }
            }
          } catch (error) {
            console.error(`Error processing election ${election.electionId}:`, error);
          }
          
          return {
            electionId: election.electionId,
            title: election.title,
            description: election.description,
            endDate: election.endDate,
            totalVotes: election.votes?.length || 0,
            totalCandidates: election.candidates?.length || 0,
            winner: null,
            winnerDeclared: false,
            hasResults: false
          };
        })
      );

      const validResults = resultsWithData
        .filter(result => result.hasResults)
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

      setAllResults(validResults);
      
      if (validResults.length > 0) {
        setLatestWinner(validResults[0]);
      } else {
        setLatestWinner(null);
      }
    } catch (error) {
      console.error("Failed to fetch all election results:", error);
      setAllResults([]);
      setLatestWinner(null);
    } finally {
      setLoading(prev => ({ ...prev, allResults: false }));
    }
  }, [fetchAllElections]);

  const fetchTotalVotes = useCallback(async () => {
    setLoading(prev => ({ ...prev, votes: true }));
    try {
      const allElections = await fetchAllElections();
      let totalVoteCount = 0;
      
      allElections.forEach(election => {
        totalVoteCount += election.votes?.length || 0;
      });
      
      setTotalVotes(totalVoteCount);
    } catch (error) {
      console.error("Error fetching total votes:", error);
      setTotalVotes(0);
    } finally {
      setLoading(prev => ({ ...prev, votes: false }));
    }
  }, [fetchAllElections]);

  const checkElectionResults = useCallback(async () => {
    setLoading(prev => ({ ...prev, results: true }));
    try {
      await fetchAllElectionResults();
    } catch (error) {
      console.error("Error fetching election results:", error);
    } finally {
      setLoading(prev => ({ ...prev, results: false }));
    }
  }, [fetchAllElectionResults]);

  useEffect(() => {
    if (userData?.role?.toLowerCase() === "voter") {
      const fetchData = async () => {
        await Promise.all([
          fetchRunningElections(),
          fetchEndedElections(),
          fetchTotalVotes(),
          fetchAllElectionResults()
        ]);
      };
      fetchData();
    }
  }, [userData, fetchRunningElections, fetchEndedElections, fetchTotalVotes, fetchAllElectionResults]);

  const castVote = useCallback(async (electionId, candidateDid) => {
    try {
      const voterDid = userData?.did;
      
      if (!voterDid) {
        toast({
          title: "Authentication required",
          description: "Please login to cast vote",
          variant: "destructive",
        });
        return;
      }

      try {
        const hasVotedResponse = await API.get(`/vote/status/${electionId}/${voterDid}`);
        if (hasVotedResponse.data.data?.hasVoted) {
          toast({
            title: "Already Voted",
            description: "You have already voted in this election",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
      }

      await API.post("/vote", { 
        electionId, 
        voterDid, 
        candidateDid 
      });
      
      toast({ 
        title: "Vote casted successfully!",
        description: "Your vote has been recorded securely.",
        variant: "success" 
      });
      
      localStorage.setItem("lastVotedElection", JSON.stringify({ 
        electionId, 
        voterDid, 
        candidateDid,
        timestamp: new Date().toISOString()
      }));
      
      await Promise.all([
        fetchRunningElections(),
        fetchTotalVotes(),
        fetchAllElectionResults()
      ]);
      
    } catch (error) {
      console.error("Vote casting error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Please try again";
      toast({
        title: "Failed to cast vote",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [userData, toast, fetchRunningElections, fetchTotalVotes, fetchAllElectionResults]);

    const handleSubmitComplaint = async () => {
    try {
      if (!complaintContent.trim()) {
        toast({
          title: "Complaint content required",
          description: "Please describe your concern",
          variant: "destructive",
        });
        return;
      }

      if (complaintContent.length > 500) {
        toast({
          title: "Complaint too long",
          description: "Please keep your complaint under 500 characters",
          variant: "destructive",
        });
        return;
      }

      await API.post("/complaint", { 
        did: userData.did, 
        content: complaintContent 
      });
      
      toast({ 
        title: "Complaint submitted!",
        description: "We'll review your concern shortly.",
        variant: "success" 
      });
      
      setComplaintContent("");
      setShowComplaintForm(false);
      
      await fetchUserComplaints();
    } catch (error) {
      console.error("Complaint submission error:", error);
      toast({
        title: "Failed to submit complaint",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  };



  const deleteComplaint = async (complaintId) => {
    try {
      await API.delete(`/complaint/${complaintId}`);
      
      toast({ 
        title: "Complaint deleted!",
        description: "Your complaint has been removed.",
        variant: "success" 
      });
      
      await fetchUserComplaints();
    } catch (error) {
      console.error("Complaint deletion error:", error);
      toast({
        title: "Failed to delete complaint",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const applyForCandidacy = async (electionId) => {
    try {
      if (!userData?.did) {
        toast({
          title: "Authentication required",
          description: "Please login to apply for candidacy",
          variant: "destructive",
        });
        return;
      }

      await API.post("/candidacy/apply", {
        electionId,
        did: userData.did,
        fullName: userData.fullName || "",
        dob: userData.dob || "",
        birthplace: userData.birthplace || "",
        username: userData.username || "",
        image: userData.image || "",
        role: "candidate",
      });
      
      toast({ 
        title: "Application submitted!",
        description: "Your candidacy application is under review.",
        variant: "success" 
      });

      try {
        const apps = await API.get(`/candidacy/applications/all`);
        const applications = handleApiResponse(apps);
        const userApp = applications.find((a) => a.did === userData.did);
        if (userApp) {
          setCandidateProfile(userApp);
        }
      } catch (error) {
        console.error("Error refreshing candidate profile:", error);
      }
    } catch (error) {
      console.error("Candidacy application error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Please try again";
      toast({
        title: "Failed to apply",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { variant: "default", icon: CheckCircle, label: "Approved" },
      pending: { variant: "secondary", icon: Clock, label: "Pending Review" },
      rejected: { variant: "destructive", icon: AlertCircle, label: "Rejected" },
      withdrawn: { variant: "outline", icon: AlertCircle, label: "Withdrawn" },
      resolved: { variant: "default", icon: CheckCircle, label: "Resolved" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const refreshData = async () => {
    await Promise.all([
      fetchRunningElections(),
      fetchEndedElections(),
      fetchTotalVotes(),
      fetchAllElectionResults(),
      activeTab === "complaints" && fetchUserComplaints()
    ]);
    toast({
      title: "Data refreshed",
      description: "Latest data has been loaded",
      variant: "success",
    });
  };

  const declareWinnerForElection = async (electionId) => {
    try {
      await API.post(`/election/${electionId}/declare-winner`);
      toast({
        title: "Winner declared!",
        description: "The winner has been declared for this election",
        variant: "success",
      });
      await fetchAllElectionResults();
      await fetchEndedElections();
    } catch (error) {
      console.error("Error declaring winner:", error);
      toast({
        title: "Failed to declare winner",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const isElectionEnded = (election) => {
    if (!election?.endDate) return false;
    try {
      const endDate = new Date(election.endDate);
      return endDate < new Date();
    } catch (error) {
      return false;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintDetail(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />

      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Vote className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Voter Dashboard</h1>
          </div>
          <p className="text-xl opacity-90">
            Welcome back, <span className="font-semibold">{userData?.fullName || userData?.username || "Voter"}</span>
          </p>
          <p className="opacity-80 mt-2">Participate in elections and view results</p>
          
          <Button 
            onClick={refreshData}
            variant="outline" 
            className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
            disabled={loading.elections || loading.votes || loading.results}
          >
            <Loader2 className={`w-4 h-4 mr-2 ${loading.elections || loading.votes || loading.results ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-6 -mt-6 mb-8">
        <div className="flex space-x-1 bg-white rounded-lg shadow-sm p-1 border">
          {[
            { id: "elections", label: "Active Elections", icon: Calendar },
            { id: "results", label: "Election Results", icon: Trophy },
            { id: "history", label: "Past Elections", icon: History },
            { id: "candidacy", label: "My Candidacy", icon: User },
            { id: "complaints", label: "Complaints", icon: AlertCircle }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex items-center gap-2 ${activeTab === tab.id ? 'bg-teal-600 text-white' : 'text-gray-600'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      <main className="container mx-auto px-6 pb-12 flex-grow">
        {/* Elections Tab */}
        {activeTab === "elections" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Elections</p>
                      {loading.elections ? (
                        <Loader2 className="w-6 h-6 animate-spin text-teal-600 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{elections.length}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Vote className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Votes</p>
                      {loading.votes ? (
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Your Status</p>
                      {loading.profile ? (
                        <Loader2 className="w-6 h-6 animate-spin text-green-600 mt-1" />
                      ) : (
                        <p className="text-lg font-bold text-gray-900 capitalize">
                          {candidateProfile?.status || "Voter"}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Elections List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Active Elections
                </h2>
                <Badge variant="outline" className="text-sm">
                  {elections.length} election(s) available
                </Badge>
              </div>
              
              {loading.elections ? (
                <Card className="bg-white shadow-lg border-0 text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-600 animate-spin" />
                  <CardTitle className="text-xl text-gray-600 mb-2">Loading Elections</CardTitle>
                  <CardDescription>Fetching active elections and candidate data...</CardDescription>
                </Card>
              ) : elections.length > 0 ? (
                elections.map((election, idx) => (
                  <Card key={idx} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-teal-700">{election.title}</CardTitle>
                          <CardDescription className="mt-2">{election.description}</CardDescription>
                          <div className="flex gap-4 mt-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {election.candidates?.length || 0} candidates
                            </span>
                            <span className="flex items-center gap-1">
                              <Vote className="w-4 h-4" />
                              {election.votes?.length || 0} votes cast
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {election.candidates && election.candidates.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-700">Candidates:</h4>
                          <div className="grid gap-3">
                            {election.candidates.map((candidate, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-4">
                                  {candidate.image ? (
                                    <img
                                      src={`data:image/png;base64,${candidate.image}`}
                                      alt="Candidate"
                                      className="w-12 h-12 rounded-full object-cover border-2 border-teal-200"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-200">
                                      <User className="w-6 h-6 text-teal-600" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {candidate.fullName || `Candidate ${candidate.did?.substring(0, 8)}`}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {candidate.username || "Candidate"} • {candidate.birthplace || "Unknown location"}
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => castVote(election.electionId, candidate.did)}
                                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                                  disabled={!userData?.did}
                                >
                                  <Vote className="w-4 h-4 mr-2" />
                                  Vote Now
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No candidates available for this election</p>
                          <p className="text-sm mt-2">Candidates may still be applying or under review</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white shadow-lg border-0 text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <CardTitle className="text-xl text-gray-600 mb-2">No Active Elections</CardTitle>
                  <CardDescription>There are no running elections at the moment. Check back later for new elections.</CardDescription>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Results Tab - Show Latest and Previous Results */}
        {activeTab === "results" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Card */}
              <Card className="bg-white shadow-lg border-0 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Elections with Results</p>
                      {loading.allResults ? (
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{allResults.length}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Votes Cast</p>
                      {loading.votes ? (
                        <Loader2 className="w-6 h-6 animate-spin text-green-600 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <History className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ended Elections</p>
                      {loading.endedElections ? (
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{endedElections.length}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Latest Result */}
            {loading.allResults ? (
              <Card className="bg-white shadow-lg border-0 text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-600 animate-spin" />
                <CardTitle className="text-xl text-gray-600 mb-2">Loading Results</CardTitle>
                <CardDescription>Fetching election results...</CardDescription>
              </Card>
            ) : latestWinner ? (
              <Card className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-2xl border-0">
                <CardHeader className="text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4" />
                  <CardTitle className="text-2xl">Latest Election Result</CardTitle>
                  <CardDescription className="text-teal-100">
                    {latestWinner.title} • Ended on {new Date(latestWinner.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold mb-2">{latestWinner.totalVotes}</div>
                    <p className="text-teal-100">Total Votes Cast</p>
                  </div>

                  <div className="bg-white rounded-2xl p-8 text-gray-800">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center border-4 border-teal-500 shadow-lg mb-4">
                        <Crown className="w-12 h-12 text-teal-600" />
                      </div>
                      
                      <h2 className="text-2xl font-bold text-teal-700 mb-2">
                        {latestWinner.winner?.name || `Candidate ${latestWinner.winner?.did?.substring(0, 8)}`}
                      </h2>
                      
                      <Badge className="bg-yellow-100 text-yellow-800 mb-4">
                        <Trophy className="w-3 h-3 mr-1" />
                        Winner
                      </Badge>

                      <div className="grid grid-cols-3 gap-6 mt-6 w-full max-w-md">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{latestWinner.totalVotes}</div>
                          <div className="text-sm text-gray-600">Total Votes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{latestWinner.totalCandidates}</div>
                          <div className="text-sm text-gray-600">Candidates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {latestWinner.maxVotes || latestWinner.totalVotes}
                          </div>
                          <div className="text-sm text-gray-600">Winning Votes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-lg border-0 text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <CardTitle className="text-xl text-gray-600 mb-2">No Results Available</CardTitle>
                <CardDescription>
                  No election results are available yet. Results will appear here once elections end and winners are declared.
                </CardDescription>
                <Button 
                  onClick={fetchAllElectionResults} 
                  variant="outline" 
                  className="mt-4"
                  disabled={loading.allResults}
                >
                  <Loader2 className={`w-4 h-4 mr-2 ${loading.allResults ? 'animate-spin' : ''}`} />
                  Check for Results
                </Button>
              </Card>
            )}

            {/* Previous Results */}
            {allResults.length > 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-6 h-6" />
                  Previous Election Results
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allResults.slice(1).map((result, index) => (
                    <Card key={result.electionId} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg text-teal-700">{result.title}</CardTitle>
                        <CardDescription>
                          Ended on {new Date(result.endDate).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-300">
                              <Trophy className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-800">
                                {result.winner?.name || `Candidate ${result.winner?.did?.substring(0, 8)}`}
                              </p>
                              <p className="text-sm text-green-600">Winner</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-gray-800">{result.totalVotes}</div>
                              <div className="text-gray-600">Total Votes</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-gray-800">{result.totalCandidates}</div>
                              <div className="text-gray-600">Candidates</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab - Show All Ended Elections */}
        {activeTab === "history" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6" />
                Past Elections
              </h2>
              <Badge variant="outline" className="text-sm">
                {endedElections.length} ended election(s)
              </Badge>
            </div>

            {loading.endedElections ? (
              <Card className="bg-white shadow-lg border-0 text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-600 animate-spin" />
                <CardTitle className="text-xl text-gray-600 mb-2">Loading Past Elections</CardTitle>
                <CardDescription>Fetching ended elections and their results...</CardDescription>
              </Card>
            ) : endedElections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedElections.map((election) => (
                  <Card key={election.electionId} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-teal-700 line-clamp-2">{election.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{election.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Ended: {new Date(election.endDate).toLocaleDateString()}</span>
                        <span>{election.votes?.length || 0} votes</span>
                      </div>
                      
                      {election.hasResults && election.winner ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                            <Trophy className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Winner: {election.winner.name}
                            </span>
                          </div>
                          <Button 
                            onClick={() => setActiveTab("results")}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Results
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">No results available</p>
                          <Button 
                            onClick={() => declareWinnerForElection(election.electionId)}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            Declare Winner
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white shadow-lg border-0 text-center py-12">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <CardTitle className="text-xl text-gray-600 mb-2">No Past Elections</CardTitle>
                <CardDescription>There are no ended elections in the system yet.</CardDescription>
              </Card>
            )}
          </div>
        )}

        {/* Candidacy Tab */}
        {activeTab === "candidacy" && (
          <div className="space-y-8">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Candidacy Status
                </CardTitle>
                <CardDescription>
                  Apply to become a candidate in active elections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading.profile ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-600 animate-spin" />
                    <p className="text-gray-600">Loading candidacy status...</p>
                  </div>
                ) : candidateProfile?.status === "approved" && (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Approved Candidate</h3>
                    <p className="text-green-700">You are an approved candidate and can participate in elections.</p>
                    <div className="mt-4">
                      {getStatusBadge("approved")}
                    </div>
                  </div>
                )}

                {candidateProfile?.status === "pending" && (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">Application Pending</h3>
                    <p className="text-yellow-700">Your candidacy application is under review.</p>
                    <div className="mt-4">
                      {getStatusBadge("pending")}
                    </div>
                  </div>
                )}

                {candidateProfile?.status === "rejected" && (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-red-800 mb-2">Application Rejected</h3>
                    <p className="text-red-700">Your candidacy application was not approved.</p>
                    <div className="mt-4">
                      {getStatusBadge("rejected")}
                    </div>
                  </div>
                )}

                {!candidateProfile && elections.length > 0 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Award className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Become a Candidate</h3>
                      <p className="text-gray-600">Apply for candidacy in any of the active elections below.</p>
                    </div>
                    
                    <div className="grid gap-4">
                      {elections.map((election) => (
                        <Card key={election.electionId} className="border border-teal-200 bg-teal-50">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-teal-800">{election.title}</h4>
                                <p className="text-sm text-teal-600 mt-1">{election.description}</p>
                                <p className="text-xs text-teal-500 mt-2">
                                  {election.candidates?.length || 0} candidates registered
                                </p>
                              </div>
                              <Button 
                                onClick={() => applyForCandidacy(election.electionId)}
                                className="bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                                disabled={!userData?.did}
                              >
                                <Award className="w-4 h-4 mr-2" />
                                Apply Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {!candidateProfile && elections.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Elections Available</h3>
                    <p className="text-gray-500">There are no active elections to apply for at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div className="space-y-8">
            {/* Complaint Submission Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Submit a Complaint
                </CardTitle>
                <CardDescription>
                  Report any issues or concerns regarding the voting process
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showComplaintForm ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <Button 
                      onClick={() => setShowComplaintForm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Submit New Complaint
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                      Your complaints are recorded securely on the blockchain
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Describe your concern
                      </label>
                      <Textarea
                        placeholder="Describe your concern or issue in detail... (What happened? When? How can we help?)"
                        value={complaintContent}
                        onChange={(e) => setComplaintContent(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {complaintContent.length}/500 characters
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSubmitComplaint}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={!complaintContent.trim() || complaintContent.length > 500}
                      >
                        Submit Complaint
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowComplaintForm(false);
                          setComplaintContent("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {complaintContent.length > 500 && (
                      <p className="text-red-500 text-sm">
                        Complaint must be less than 500 characters
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Complaints Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      My Complaints
                    </CardTitle>
                    <CardDescription>
                      View and manage your submitted complaints
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {complaints.filter(c => c.status === 'pending').length} pending
                    </Badge>
                    <Badge variant="outline" className="text-sm bg-green-100 text-green-800">
                      {complaints.filter(c => c.status === 'resolved').length} resolved
                    </Badge>
                    <Button
                      onClick={refreshComplaints}
                      variant="outline"
                      size="sm"
                      disabled={loading.complaints}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading.complaints ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search by complaint ID or content..."
                      value={searchComplaintId}
                      onChange={(e) => setSearchComplaintId(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={complaintFilter === "all" ? "default" : "outline"}
                      onClick={() => setComplaintFilter("all")}
                      size="sm"
                    >
                      All ({complaints.length})
                    </Button>
                    <Button
                      variant={complaintFilter === "pending" ? "default" : "outline"}
                      onClick={() => setComplaintFilter("pending")}
                      size="sm"
                    >
                      Pending ({complaints.filter(c => c.status === 'pending').length})
                    </Button>
                    <Button
                      variant={complaintFilter === "resolved" ? "default" : "outline"}
                      onClick={() => setComplaintFilter("resolved")}
                      size="sm"
                    >
                      Resolved ({complaints.filter(c => c.status === 'resolved').length})
                    </Button>
                  </div>
                </div>

                {/* Complaints List */}
                {loading.complaints ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 text-teal-600 animate-spin" />
                    <p className="text-gray-600">Loading your complaints...</p>
                  </div>
                ) : filteredComplaints.length > 0 ? (
                  <div className="space-y-4">
                    {filteredComplaints.map((complaint, index) => {
                      const displayId = complaint.id 
                        ? (complaint.id.includes('-') 
                            ? complaint.id.substring(complaint.id.lastIndexOf('-') + 1, complaint.id.length) 
                            : complaint.id.substring(0, 8))
                        : `temp-${index}`;
                      
                      return (
                        <Card 
                          key={complaint.id || `complaint-${index}`} 
                          className={`border-l-4 hover:shadow-md transition-shadow ${
                            complaint.status === 'resolved' 
                              ? 'border-l-green-500 bg-green-50/50' 
                              : 'border-l-orange-500 bg-orange-50/50'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-medium text-gray-900">
                                    Complaint #{displayId}
                                  </p>
                                  {getStatusBadge(complaint.status)}
                                  {complaint.response && (
                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                      Has Response
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Complaint Content */}
                                <div className="mb-3">
                                  <p className="text-gray-700 whitespace-pre-wrap">
                                    {complaint.content || "No content available"}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Submitted: {formatDate(complaint.timestamp)}</span>
                                  </div>
                                </div>
                                
                                {/* Admin Response Display */}
                                {complaint.response && complaint.response.trim() && (
                                  <div className="mt-4 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="font-semibold text-green-800">Admin Response</span>
                                      {complaint.respondedBy && (
                                        <Badge variant="outline" className="text-xs">
                                          By: {complaint.respondedBy}
                                        </Badge>
                                      )}
                                      {complaint.status === 'resolved' && (
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                          Resolved
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-gray-800 whitespace-pre-wrap mb-2">{complaint.response}</p>
                                    {complaint.responseAt && (
                                      <p className="text-green-600 text-sm">
                                        Responded on {formatDate(complaint.responseAt)}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Show pending message only if no response AND status is pending */}
                                {!complaint.response && complaint.status === 'pending' && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-blue-600" />
                                      <span className="text-blue-700 text-sm">
                                        Your complaint is under review. An administrator will respond shortly.
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewComplaintDetails(complaint)}
                                  title="View full details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {!complaint.response && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (complaint.id && !complaint.id.includes('temp')) {
                                        deleteComplaint(complaint.id);
                                      } else {
                                        toast({
                                          title: "Cannot delete",
                                          description: "This complaint doesn't have a valid ID yet",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    title="Delete complaint"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 text-lg">
                      {complaints.length === 0 ? "No complaints found" : "No complaints match your filters"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchComplaintId 
                        ? "Try adjusting your search criteria" 
                        : complaints.length === 0 
                          ? "You haven't submitted any complaints yet" 
                          : `No ${complaintFilter} complaints found`}
                    </p>
                    
                    {complaints.length === 0 ? (
                      <Button 
                        onClick={() => setShowComplaintForm(true)}
                        variant="outline"
                        className="mt-4"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Submit Your First Complaint
                      </Button>
                    ) : (
                      <div className="space-x-2 mt-4">
                        <Button 
                          onClick={() => setComplaintFilter("all")}
                          variant="outline"
                          size="sm"
                        >
                          Show All Complaints
                        </Button>
                        <Button 
                          onClick={refreshComplaints}
                          variant="outline"
                          size="sm"
                        >
                          Refresh List
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complaint Detail Modal */}
            {showComplaintDetail && selectedComplaint && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="bg-white shadow-2xl border-0 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      Complaint Details
                    </CardTitle>
                    <CardDescription>
                      Complaint #{selectedComplaint.id?.substring(selectedComplaint.id?.lastIndexOf('-') + 1) || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Complaint Information */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Complaint Information</h3>
                        {getStatusBadge(selectedComplaint.status)}
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.content}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Submitted:</span>
                          <p className="text-gray-800">{formatDate(selectedComplaint.timestamp)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Complaint ID:</span>
                          <p className="text-gray-800 font-mono text-xs">{selectedComplaint.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Response Section */}
                    {selectedComplaint.response && selectedComplaint.response.trim() ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Admin Response
                        </h3>
                        
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            {selectedComplaint.respondedBy && (
                              <Badge variant="outline" className="bg-white">
                                By: {selectedComplaint.respondedBy}
                              </Badge>
                            )}
                            {selectedComplaint.responseAt && (
                              <Badge variant="outline" className="bg-white">
                                On: {formatDate(selectedComplaint.responseAt)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-800 whitespace-pre-wrap">{selectedComplaint.response}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-700 font-medium">Awaiting Response</p>
                        <p className="text-blue-600 text-sm mt-1">
                          Your complaint is under review. An administrator will respond shortly.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <div className="flex justify-end gap-3 p-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowComplaintDetail(false)}
                    >
                      Close
                    </Button>
                    {!selectedComplaint.response && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteComplaint(selectedComplaint.id);
                          setShowComplaintDetail(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Complaint
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VoterDashboard;
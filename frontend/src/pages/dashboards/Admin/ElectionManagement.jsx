import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import API from "@/services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  Vote, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  RefreshCw,
  Play,
  StopCircle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart4,
  Crown,
  AlertTriangle,
  Trophy
} from "lucide-react";

// ✅ Utility: Correct active check using UTC
const isElectionActive = (election) => {
  if (!election?.startDate || !election?.endDate) return false;
  try {
    const now = Date.now();
    const start = Date.parse(election.startDate);
    const end = Date.parse(election.endDate);
    return start <= now && now <= end;
  } catch (error) {
    console.error("Error checking election activity:", error);
    return false;
  }
};

// ✅ Utility: Check if election has ended
const isElectionEnded = (election) => {
  if (!election?.endDate) return false;
  try {
    const now = Date.now();
    const end = Date.parse(election.endDate);
    return now > end;
  } catch (error) {
    console.error("Error checking election end:", error);
    return false;
  }
};

// ✅ Utility: Format date for datetime-local input field
const formatDateForInput = (dateStr) => {
  try {
    const date = new Date(dateStr);
    const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// ✅ Get election status with badge variant
const getElectionStatus = (election) => {
  if (!election) return { status: "unknown", variant: "secondary", label: "Unknown" };
  
  if (isElectionActive(election)) {
    return { status: "active", variant: "success", label: "Active", icon: Play };
  } else if (isElectionEnded(election)) {
    return { status: "ended", variant: "destructive", label: "Ended", icon: StopCircle };
  } else {
    return { status: "upcoming", variant: "secondary", label: "Upcoming", icon: Clock };
  }
};

// ✅ Modal: Election Details with Auto Winner Declaration
const ElectionDetailsModal = ({ election, onClose, onEdit, onDelete, onRefresh }) => {
  const [winner, setWinner] = useState(null);
  const [loadingWinner, setLoadingWinner] = useState(false);
  const [detailedResults, setDetailedResults] = useState([]);
  const [declaringWinner, setDeclaringWinner] = useState(false);
  const status = getElectionStatus(election);

  // ✅ Auto-declare winner and fetch results
  useEffect(() => {
    const fetchWinnerAndResults = async () => {
      if (isElectionEnded(election)) {
        setLoadingWinner(true);
        try {
          // Use auto-processing endpoint that declares winner automatically
          const response = await API.get(`/election/${election.electionId}/results/auto`);
          
          if (response.data?.data?.winnerDeclared && response.data.data.winner) {
            setWinner(response.data.data.winner);
            setDetailedResults(response.data.data.results || []);
          } else {
            // If no winner declared yet, try to force declaration
            await declareWinner();
          }
        } catch (error) {
          console.error("Error fetching winner:", error);
          // Try alternative endpoint
          try {
            const altResponse = await API.get(`/vote/result/${election.electionId}`);
            if (altResponse.data?.data?.winner) {
              setWinner(altResponse.data.data.winner);
            }
          } catch (altError) {
            console.error("Alternative endpoint also failed:", altError);
          }
        } finally {
          setLoadingWinner(false);
        }
      }
    };

    fetchWinnerAndResults();
  }, [election]);

  // ✅ Function to manually declare winner
  const declareWinner = async () => {
    setDeclaringWinner(true);
    try {
      const response = await API.post(`/election/${election.electionId}/declare-winner`);
      if (response.data?.data?.winner) {
        setWinner(response.data.data.winner);
        setDetailedResults(response.data.data.election?.finalResults || []);
        toast({
          title: "Winner declared successfully!",
          variant: "success",
        });
        onRefresh(); // Refresh the parent list
      }
    } catch (error) {
      console.error("Error declaring winner:", error);
      toast({
        title: "Failed to declare winner",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeclaringWinner(false);
    }
  };

  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Election Details</h3>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Election ID</label>
              <p className="text-gray-900 font-mono">{election.electionId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Title</label>
              <p className="text-gray-900 font-medium">{election.title}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-900">{election.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Start Date</label>
              <p className="text-gray-900">{new Date(election.startDate).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">End Date</label>
              <p className="text-gray-900">{new Date(election.endDate).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Candidates</label>
              <p className="text-gray-900">{election.candidates?.length || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Voters</label>
              <p className="text-gray-900">{election.voters?.length || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total Votes</label>
              <p className="text-gray-900">{election.votes?.length || 0}</p>
            </div>
            {election.winnerDeclared && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Winner Declared At</label>
                <p className="text-gray-900">
                  {election.winnerDeclaredAt ? new Date(election.winnerDeclaredAt).toLocaleString() : 'Auto-declared'}
                </p>
              </div>
            )}
          </div>

          {/* ✅ Enhanced Winner Info with Auto Declaration */}
          {isElectionEnded(election) && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Election Results
                </h4>
                {!winner && !loadingWinner && (
                  <Button 
                    onClick={declareWinner}
                    disabled={declaringWinner}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {declaringWinner ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4" />
                    )}
                    {declaringWinner ? "Declaring..." : "Declare Winner"}
                  </Button>
                )}
              </div>
              
              {loadingWinner ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Processing results and declaring winner...</p>
                </div>
              ) : winner ? (
                <>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-4">
                      {winner.image && (
                        <img
                          src={`data:image/png;base64,${winner.image}`}
                          alt="Winner"
                          className="w-16 h-16 rounded-full object-cover border-4 border-green-300"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="w-5 h-5 text-yellow-500" />
                          <p className="text-xl font-bold text-green-800">{winner.fullName || winner.name}</p>
                        </div>
                        <p className="text-green-600 text-sm">DID: {winner.did}</p>
                        <p className="text-green-500 text-sm font-medium">
                          🎉 Winner with {winner.votes || election.maxVotes || 0} votes
                        </p>
                        {election.isTie && (
                          <p className="text-orange-600 text-sm mt-1">
                            ⚠️ Election resulted in a tie - winner selected alphabetically
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Results Table */}
                  {detailedResults.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-gray-700 mb-3">Detailed Results:</h5>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {detailedResults.map((candidate, index) => (
                          <div 
                            key={candidate.candidateDid} 
                            className={`flex justify-between items-center p-3 rounded-lg border ${
                              index === 0 
                                ? 'bg-green-50 border-green-200 shadow-sm' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-medium ${
                                index === 0 ? 'text-green-800' : 'text-gray-800'
                              }`}>
                                {candidate.candidateName}
                              </span>
                              {index === 0 && (
                                <Badge variant="success" className="text-xs">
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`font-bold ${
                                index === 0 ? 'text-green-700' : 'text-gray-700'
                              }`}>
                                {candidate.votes} votes
                              </span>
                              <span className="text-sm text-gray-600 ml-2">{candidate.percentage}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-yellow-800 font-medium">No winner declared yet</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    The election has ended but no winner has been declared automatically.
                  </p>
                  <Button 
                    onClick={declareWinner}
                    disabled={declaringWinner}
                    className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                  >
                    {declaringWinner ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Declaring Winner...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Declare Winner Now
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button 
              onClick={() => onEdit(election)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit Election
            </Button>
            <div className="flex gap-2">
              <Button 
                onClick={onRefresh}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button 
                onClick={() => onDelete(election.electionId)} 
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Election
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 border-t">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ✅ Modal: Edit Election
const ElectionEditModal = ({ election, onClose, onSave }) => {
  const [editableElection, setEditableElection] = useState({ ...election });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableElection((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editableElection.title?.trim() || !editableElection.description?.trim()) {
      alert("Title and description are required.");
      return;
    }

    setSaving(true);
    try {
      await onSave(editableElection);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Election</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Election ID</label>
              <Input value={election.electionId} disabled className="bg-gray-50 font-mono" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Title *</label>
              <Input
                type="text"
                name="title"
                value={editableElection.title}
                onChange={handleInputChange}
                placeholder="Enter election title"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description *</label>
              <Textarea
                name="description"
                value={editableElection.description}
                onChange={handleInputChange}
                placeholder="Enter election description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date *</label>
                <Input
                  type="datetime-local"
                  name="startDate"
                  value={formatDateForInput(editableElection.startDate)}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">End Date *</label>
                <Input
                  type="datetime-local"
                  name="endDate"
                  value={formatDateForInput(editableElection.endDate)}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t mt-6">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Page: Election Management
const ElectionManagement = () => {
  const { toast } = useToast();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingElections, setProcessingElections] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  // ✅ Filter elections based on search and status
  useEffect(() => {
    let filtered = Array.isArray(elections) ? [...elections] : [];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(election =>
        election.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.electionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(election => {
        const status = getElectionStatus(election);
        return status.status === statusFilter;
      });
    }
    
    setFilteredElections(filtered);
  }, [elections, searchTerm, statusFilter]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching elections...");
      
      const response = await API.get("/elections");
      console.log("📨 Elections API response:", response);
      
      // Handle different response structures
      let electionsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        electionsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        electionsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        electionsData = [response.data];
      } else {
        console.warn("⚠️ Unexpected response structure:", response.data);
        electionsData = [];
      }
      
      console.log(`✅ Loaded ${electionsData.length} elections`);
      setElections(electionsData);
      
    } catch (error) {
      console.error("❌ Error fetching elections:", error);
      toast({
        title: "Failed to load elections",
        description: error.response?.data?.error || "Please check your network connection",
        variant: "destructive",
      });
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Process ended elections to auto-declare winners
  const processEndedElections = async () => {
    setProcessingElections(true);
    try {
      const response = await API.post("/system/archive-elections");
      if (response.data?.data?.winnersDeclared > 0) {
        toast({
          title: "Auto-processing completed!",
          description: `Declared winners for ${response.data.data.winnersDeclared} elections`,
          variant: "success",
        });
        await fetchElections(); // Refresh the list
      } else {
        toast({
          title: "No elections to process",
          description: "All ended elections already have winners declared",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error processing elections:", error);
      toast({
        title: "Failed to process elections",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    } finally {
      setProcessingElections(false);
    }
  };

  const showElectionDetails = (election) => {
    setSelectedElection(election);
    setShowModal(true);
    setIsEditing(false);
  };

  const editElection = (election) => {
    setSelectedElection(election);
    setIsEditing(true);
  };

  const saveElection = async (updatedElection) => {
    try {
      await API.put(`/election/${updatedElection.electionId}`, {
        title: updatedElection.title,
        description: updatedElection.description,
        startDate: updatedElection.startDate,
        endDate: updatedElection.endDate
      });
      
      toast({
        title: "Election updated successfully",
        variant: "success",
      });
      
      await fetchElections();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error updating election:", error);
      toast({
        title: "Failed to update election",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const deleteElection = async (electionId) => {
    if (!window.confirm("Are you sure you want to delete this election? This action cannot be undone and will remove all associated data.")) {
      return;
    }

    try {
      await API.delete(`/election/${electionId}`);
      toast({
        title: "Election deleted successfully",
        variant: "success",
      });
      await fetchElections();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error deleting election:", error);
      toast({
        title: "Failed to delete election",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedElection(null);
    setIsEditing(false);
  };

  const getStats = () => {
    const total = Array.isArray(elections) ? elections.length : 0;
    const active = elections.filter(isElectionActive).length;
    const upcoming = elections.filter(e => !isElectionActive(e) && !isElectionEnded(e)).length;
    const ended = elections.filter(isElectionEnded).length;
    const winnersDeclared = elections.filter(e => e.winnerDeclared).length;
    
    return { total, active, upcoming, ended, winnersDeclared };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading elections...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Election Management</h1>
          </div>
          <p className="text-xl opacity-90">
            Manage and monitor all elections with automatic winner declaration
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Vote className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Elections</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <StopCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ended</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ended}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Winners Declared</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.winnersDeclared}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Actions */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search elections by title, ID, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={processEndedElections}
                  disabled={processingElections}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {processingElections ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4" />
                  )}
                  {processingElections ? "Processing..." : "Declare Winners"}
                </Button>
                <Button onClick={fetchElections} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elections Grid */}
        {!Array.isArray(filteredElections) || filteredElections.length === 0 ? (
          <Card className="bg-white shadow-lg border-0 text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <CardTitle className="text-xl text-gray-600 mb-2">
              {searchTerm || statusFilter !== "all" ? "No matching elections found" : "No elections available"}
            </CardTitle>
            <CardDescription>
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search criteria or filters." 
                : "Create your first election to get started."
              }
            </CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => {
              const status = getElectionStatus(election);
              const StatusIcon = status.icon;
              
              return (
                <Card key={election.electionId} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-teal-700 line-clamp-2">
                        {election.title}
                      </CardTitle>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={status.variant} className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                        {election.winnerDeclared && (
                          <Badge variant="success" className="text-xs">
                            <Crown className="w-2 h-2 mr-1" />
                            Winner Declared
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {election.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Start</p>
                        <p className="font-medium">
                          {new Date(election.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">End</p>
                        <p className="font-medium">
                          {new Date(election.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{election.candidates?.length || 0} candidates</span>
                      <span>{election.votes?.length || 0} votes</span>
                    </div>

                    {election.winnerDeclared && election.winnerFullName && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-green-800 text-sm font-medium">
                          🏆 Winner: {election.winnerFullName}
                        </p>
                        <p className="text-green-600 text-xs">
                          {election.maxVotes} votes
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => showElectionDetails(election)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && selectedElection && (
        isEditing ? (
          <ElectionEditModal
            election={selectedElection}
            onClose={closeModal}
            onSave={saveElection}
          />
        ) : (
          <ElectionDetailsModal
            election={selectedElection}
            onClose={closeModal}
            onEdit={editElection}
            onDelete={deleteElection}
            onRefresh={fetchElections}
          />
        )
      )}

      <Footer />
    </div>
  );
};

export default ElectionManagement;
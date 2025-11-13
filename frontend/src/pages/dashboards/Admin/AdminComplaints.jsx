import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";
import { 
  Search, 
  MessageSquare, 
  Clock, 
  User, 
  Send, 
  Filter,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  RefreshCw
} from "lucide-react";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [searchDid, setSearchDid] = useState("");
  const [replyText, setReplyText] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, resolved
  const [showReplyModal, setShowReplyModal] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = searchDid.trim()
        ? `/complaints/user/${searchDid}`
        : "/complaints";

      const { data } = await API.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Process complaints with proper IDs
      const complaintsData = Array.isArray(data) ? data : (data.data || []);
      const processedComplaints = complaintsData.map(complaint => ({
        ...complaint,
        id: complaint.id || complaint.key, // Use id if available, fallback to key
        status: complaint.response ? "resolved" : "pending",
        timestamp: complaint.timestamp || new Date().toISOString()
      }));
      
      setComplaints(processedComplaints);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      alert("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedComplaint) return;

    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(atob(token.split(".")[1]));
      
      const response = await API.post(
        "/complaint/reply",
        {
          complaintId: selectedComplaint.id,
          responderDid: userData.did,
          responseText: replyText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setReplyText("");
        setSelectedComplaint(null);
        setShowReplyModal(false);
        
        // Force refresh with a small delay to ensure backend processes the update
        setTimeout(() => {
          fetchComplaints();
        }, 500);
        
        // FIXED: Using alert instead of undefined toast
        alert("Reply submitted successfully! The complaint has been marked as resolved.");
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Failed to reply to complaint:", error);
      // FIXED: Using alert instead of undefined toast
      alert(`Failed to submit reply: ${error.response?.data?.error || error.message}`);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [searchDid]);

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === "all") return true;
    return complaint.status === filter;
  });

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === "resolved") {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
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

  const openReplyModal = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText("");
    setShowReplyModal(true);
  };

  // Debug function to check complaint IDs
  const debugComplaints = () => {
    console.log("Current complaints:", complaints);
    complaints.forEach((complaint, index) => {
      console.log(`Complaint ${index}:`, {
        id: complaint.id,
        key: complaint.key,
        did: complaint.did,
        content: complaint.content?.substring(0, 50) + "..."
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                  Complaints Management
                </h1>
                <p className="text-gray-600">
                  Monitor and respond to user complaints and feedback
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={debugComplaints}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  title="Debug complaint IDs in console"
                >
                  <AlertCircle className="w-4 h-4" />
                  Debug IDs
                </button>
                <button
                  onClick={fetchComplaints}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{complaints.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Response</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {complaints.filter(c => !c.response).length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {complaints.filter(c => c.response).length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by User DID..."
                  value={searchDid}
                  onChange={(e) => setSearchDid(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filter === "all" 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filter === "pending" 
                      ? "bg-yellow-600 text-white border-yellow-600" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter("resolved")}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filter === "resolved" 
                      ? "bg-green-600 text-white border-green-600" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading complaints...</span>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No complaints found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchDid ? "Try adjusting your search criteria" : "All complaints are resolved"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredComplaints.map((complaint, index) => (
                  <div key={complaint.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Complaint Content */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-medium text-gray-900">{complaint.did}</p>
                              <span className={getStatusBadge(complaint.status)}>
                                {complaint.status === "resolved" ? "Resolved" : "Pending"}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{complaint.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(complaint.timestamp)}</span>
                              </div>
                              {complaint.id && (
                                <div className="text-xs text-gray-400">
                                  ID: {complaint.id.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Response Section */}
                        {complaint.response && (
                          <div className="ml-11 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-800">Admin Response</span>
                            </div>
                            <p className="text-green-700">{complaint.response}</p>
                            {complaint.responseAt && (
                              <p className="text-green-600 text-sm mt-2">
                                Replied on {formatDate(complaint.responseAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 lg:flex-col">
                        {!complaint.response && (
                          <button
                            onClick={() => openReplyModal(complaint)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reply Modal */}
      {showReplyModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Reply to Complaint
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Responding to complaint from <span className="font-medium">{selectedComplaint.did}</span>
              </p>
              {selectedComplaint.id && (
                <p className="text-gray-500 text-xs mt-1">
                  Complaint ID: {selectedComplaint.id}
                </p>
              )}
            </div>

            <div className="p-6">
              {/* Original Complaint */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Original Complaint:</h3>
                <p className="text-gray-700">{selectedComplaint.content}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Submitted on {formatDate(selectedComplaint.timestamp)}
                </p>
              </div>

              {/* Reply Textarea */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the user here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminComplaints;
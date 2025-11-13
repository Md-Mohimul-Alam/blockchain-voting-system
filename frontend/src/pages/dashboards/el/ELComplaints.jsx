import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import API from '@/services/api';
import {
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Mail
} from 'lucide-react';

const ELComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await API.get('/complaints');
      setComplaints(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      toast({
        title: "Failed to load complaints",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (complaintId) => {
    try {
      await API.post('/complaint/reply', {
        complaintId,
        reply: replyText
      });
      toast({
        title: "Reply Sent",
        description: "Your response has been sent to the user."
      });
      setReplyText('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast({
        title: "Failed to send reply",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`${priorityConfig[priority] || priorityConfig.medium} border-0`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || complaint.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-teal-600" />
              Complaint Management
            </h1>
            <p className="text-gray-600 mt-2">Review and respond to user complaints and issues</p>
          </div>
          <Button onClick={fetchComplaints} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search complaints by user, subject, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Complaints List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredComplaints.length === 0 ? (
                <Card className="bg-white shadow-lg border-0 text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Complaints Found</h3>
                  <p className="text-gray-600">There are no complaints matching your criteria.</p>
                </Card>
              ) : (
                filteredComplaints.map((complaint) => (
                  <Card 
                    key={complaint.complaintId} 
                    className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{complaint.userId}</h3>
                            <p className="text-sm text-gray-600">{complaint.subject}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getPriorityBadge(complaint.priority)}
                          {getStatusBadge(complaint.status)}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 line-clamp-2">{complaint.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        {complaint.replies?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {complaint.replies.length} replies
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Reply Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-0 sticky top-8">
              <CardHeader>
                <CardTitle>Reply to Complaint</CardTitle>
                <CardDescription>
                  {selectedComplaint ? `Responding to ${selectedComplaint.userId}` : 'Select a complaint to respond'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedComplaint ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Complaint Details:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedComplaint.description}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Response:</label>
                      <Textarea
                        placeholder="Type your response here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={6}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      onClick={() => handleReply(selectedComplaint.complaintId)}
                      disabled={!replyText.trim()}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Response
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Select a complaint from the list to respond</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <Card className="mt-8 bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Complaint Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">
                  {complaints.filter(c => c.status === 'open').length}
                </p>
                <p className="text-sm text-red-600">Open</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">
                  {complaints.filter(c => c.status === 'in-progress').length}
                </p>
                <p className="text-sm text-yellow-600">In Progress</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
                <p className="text-sm text-green-600">Resolved</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-700">
                  {complaints.filter(c => c.status === 'closed').length}
                </p>
                <p className="text-sm text-gray-600">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ELComplaints;
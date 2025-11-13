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
  UserPlus,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
  Calendar
} from 'lucide-react';

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedElection, setSelectedElection] = useState('');
  const [manifesto, setManifesto] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, electionsRes] = await Promise.all([
        API.get('/candidacy/applications/status/pending'),
        API.get('/elections/upcoming')
      ]);

      setApplications(applicationsRes.data?.data || []);
      setElections(electionsRes.data?.data || electionsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    try {
      await API.post('/candidacy/apply', {
        electionId: selectedElection,
        manifesto: manifesto
      });
      toast({
        title: "Application Submitted",
        description: "Your candidate application has been submitted for review."
      });
      setShowApplicationForm(false);
      setSelectedElection('');
      setManifesto('');
      fetchData();
    } catch (error) {
      toast({
        title: "Application Failed",
        variant: "destructive"
      });
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    try {
      await API.post('/candidacy/withdraw', { applicationId });
      toast({
        title: "Application Withdrawn",
        description: "Your candidate application has been withdrawn."
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading applications...</p>
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
              <UserPlus className="w-8 h-8 text-teal-600" />
              My Candidate Applications
            </h1>
            <p className="text-gray-600 mt-2">Manage your candidate applications and track their status</p>
          </div>
          <Button onClick={() => setShowApplicationForm(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Submit Candidate Application</CardTitle>
                <CardDescription>Apply to become a candidate in an upcoming election</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Election</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={selectedElection}
                    onChange={(e) => setSelectedElection(e.target.value)}
                  >
                    <option value="">Choose an election</option>
                    {elections.map(election => (
                      <option key={election.electionId} value={election.electionId}>
                        {election.title} - {new Date(election.startDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Manifesto</label>
                  <Textarea
                    placeholder="Describe your platform, goals, and why you should be elected..."
                    value={manifesto}
                    onChange={(e) => setManifesto(e.target.value)}
                    rows={6}
                    className="w-full"
                  />
                </div>
              </CardContent>
              <CardContent className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowApplicationForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitApplication}
                  disabled={!selectedElection || !manifesto.trim()}
                >
                  Submit Application
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length === 0 ? (
            <Card className="bg-white shadow-lg border-0 text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any candidate applications yet.</p>
              <Button onClick={() => setShowApplicationForm(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Your First Application
              </Button>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.applicationId} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{application.electionTitle}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Start: {new Date(application.electionStartDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              End: {new Date(application.electionEndDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Your Manifesto:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {application.manifesto || "No manifesto provided."}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {getStatusBadge(application.status)}
                        <span className="text-sm text-gray-600">
                          Applied: {new Date(application.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {application.status === 'pending' && (
                        <Button 
                          variant="outline"
                          onClick={() => handleWithdrawApplication(application.applicationId)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Withdraw
                        </Button>
                      )}
                      <Button variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Statistics */}
        <Card className="mt-8 bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">
                  {applications.filter(a => a.status === 'pending').length}
                </p>
                <p className="text-sm text-yellow-600">Pending Review</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {applications.filter(a => a.status === 'approved').length}
                </p>
                <p className="text-sm text-green-600">Approved</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">
                  {applications.filter(a => a.status === 'rejected').length}
                </p>
                <p className="text-sm text-red-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateApplications;
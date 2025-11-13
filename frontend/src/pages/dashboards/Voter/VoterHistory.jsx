import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import API from '@/services/api';
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Vote
} from 'lucide-react';

const VoterHistory = () => {
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchVotingHistory();
  }, []);

  const fetchVotingHistory = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await API.get(`/vote/history/${user.did}`);
      setVotingHistory(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch voting history:', error);
      toast({
        title: "Failed to load voting history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (start > now) {
      return <Badge className="bg-purple-100 text-purple-800 border-0">Upcoming</Badge>;
    } else if (start <= now && now <= end) {
      return <Badge className="bg-green-100 text-green-800 border-0">Running</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-0">Completed</Badge>;
    }
  };

  const getVoteStatusBadge = (hasVoted, election) => {
    const now = new Date();
    const end = new Date(election.endDate);

    if (hasVoted) {
      return (
        <Badge className="bg-green-100 text-green-800 border-0">
          <CheckCircle className="w-3 h-3 mr-1" />
          Voted
        </Badge>
      );
    } else if (now > end) {
      return (
        <Badge className="bg-red-100 text-red-800 border-0">
          <AlertCircle className="w-3 h-3 mr-1" />
          Missed
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-0">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const filteredHistory = votingHistory.filter(history => {
    const matchesSearch = history.electionTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'voted' && history.hasVoted) ||
                         (filter === 'pending' && !history.hasVoted && new Date(history.endDate) > new Date()) ||
                         (filter === 'missed' && !history.hasVoted && new Date(history.endDate) <= new Date());
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading voting history...</p>
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
              <History className="w-8 h-8 text-teal-600" />
              My Voting History
            </h1>
            <p className="text-gray-600 mt-2">Track your participation in all elections</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchVotingHistory} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search elections..."
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
                  <option value="all">All Elections</option>
                  <option value="voted">Voted</option>
                  <option value="pending">Pending</option>
                  <option value="missed">Missed</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voting History */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card className="bg-white shadow-lg border-0 text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Voting History Found</h3>
              <p className="text-gray-600">You haven't participated in any elections yet.</p>
            </Card>
          ) : (
            filteredHistory.map((history) => (
              <Card key={history.electionId} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Vote className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{history.electionTitle}</h3>
                          <p className="text-gray-600">{history.electionDescription}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Start: {new Date(history.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          End: {new Date(history.endDate).toLocaleDateString()}
                        </span>
                        {history.votedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Voted: {new Date(history.votedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        {getStatusBadge(history)}
                        {getVoteStatusBadge(history.hasVoted, history)}
                      </div>
                      {history.hasVoted && (
                        <Button variant="outline" size="sm">
                          View Receipt
                        </Button>
                      )}
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
            <CardTitle>Voting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Vote className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">
                  {votingHistory.length}
                </p>
                <p className="text-sm text-blue-600">Total Elections</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {votingHistory.filter(h => h.hasVoted).length}
                </p>
                <p className="text-sm text-green-600">Participated</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">
                  {votingHistory.filter(h => !h.hasVoted && new Date(h.endDate) <= new Date()).length}
                </p>
                <p className="text-sm text-red-600">Missed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default VoterHistory;
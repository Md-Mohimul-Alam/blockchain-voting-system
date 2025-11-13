import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import API from '@/services/api';
import {
  Vote,
  Calendar,
  Clock,
  PlayCircle,
  CheckCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  BarChart3,
  ExternalLink
} from 'lucide-react';

const VoterElections = () => {
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      const [electionsRes, votedRes] = await Promise.all([
        API.get('/elections'),
        API.get(`/vote/voted-elections/${user.did}`)
      ]);

      setElections(electionsRes.data?.data || electionsRes.data || []);
      setVotedElections(votedRes.data?.data || votedRes.data || []);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      toast({
        title: "Failed to load elections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (start > now) {
      return { 
        status: 'upcoming', 
        color: 'bg-purple-100 text-purple-800', 
        icon: Clock,
        description: 'Starts soon'
      };
    } else if (start <= now && now <= end) {
      return { 
        status: 'running', 
        color: 'bg-green-100 text-green-800', 
        icon: PlayCircle,
        description: 'Voting active'
      };
    } else {
      return { 
        status: 'ended', 
        color: 'bg-gray-100 text-gray-800', 
        icon: CheckCircle,
        description: 'Voting closed'
      };
    }
  };

  const hasVoted = (electionId) => {
    return votedElections.some(election => election.electionId === electionId);
  };

  const getVotingStatus = (election) => {
    const statusInfo = getElectionStatus(election);
    
    if (hasVoted(election.electionId)) {
      return (
        <Badge className="bg-green-100 text-green-800 border-0">
          <CheckCircle className="w-3 h-3 mr-1" />
          Voted
        </Badge>
      );
    }

    if (statusInfo.status === 'running') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-0">
          <Vote className="w-3 h-3 mr-1" />
          Vote Now
        </Badge>
      );
    }

    return (
      <Badge className={`${statusInfo.color} border-0`}>
        <statusInfo.icon className="w-3 h-3 mr-1" />
        {statusInfo.description}
      </Badge>
    );
  };

  const getTimeRemaining = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (start > now) {
      const diff = start - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `Starts in ${days} day${days !== 1 ? 's' : ''}`;
    } else if (start <= now && now <= end) {
      const diff = end - now;
      const hours = Math.ceil(diff / (1000 * 60 * 60));
      return `${hours} hours remaining`;
    } else {
      return 'Voting ended';
    }
  };

  const getVoterEligibility = (election) => {
    // In a real app, this would check voter eligibility rules
    const statusInfo = getElectionStatus(election);
    
    if (statusInfo.status === 'ended') {
      return { eligible: false, reason: 'Election has ended' };
    }
    
    if (hasVoted(election.electionId)) {
      return { eligible: false, reason: 'Already voted' };
    }

    if (statusInfo.status === 'upcoming') {
      return { eligible: false, reason: 'Voting not started' };
    }

    return { eligible: true, reason: 'Eligible to vote' };
  };

  const handleVoteClick = (election) => {
    const eligibility = getVoterEligibility(election);
    
    if (!eligibility.eligible) {
      toast({
        title: "Cannot Vote",
        description: eligibility.reason,
        variant: "destructive"
      });
      return;
    }

    // Navigate to voting page or open voting modal
    window.location.href = `/vote?election=${election.electionId}`;
  };

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'votable' && getVoterEligibility(election).eligible) ||
                         (filter === 'voted' && hasVoted(election.electionId)) ||
                         (filter === 'upcoming' && getElectionStatus(election).status === 'upcoming') ||
                         (filter === 'ended' && getElectionStatus(election).status === 'ended');

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading elections...</p>
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
              <Vote className="w-8 h-8 text-teal-600" />
              Available Elections
            </h1>
            <p className="text-gray-600 mt-2">Participate in ongoing elections and make your voice heard</p>
          </div>
          <Button onClick={fetchElections} variant="outline">
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
                  placeholder="Search elections by title or description..."
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
                  <option value="votable">Can Vote Now</option>
                  <option value="voted">Already Voted</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ended">Ended</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Vote className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {elections.filter(e => getElectionStatus(e).status === 'running').length}
              </p>
              <p className="text-sm text-blue-600">Active Elections</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">
                {votedElections.length}
              </p>
              <p className="text-sm text-green-600">Voted In</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {elections.filter(e => getElectionStatus(e).status === 'upcoming').length}
              </p>
              <p className="text-sm text-purple-600">Upcoming</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-700">
                {elections.length}
              </p>
              <p className="text-sm text-gray-600">Total Elections</p>
            </CardContent>
          </Card>
        </div>

        {/* Elections List */}
        <div className="space-y-6">
          {filteredElections.length === 0 ? (
            <Card className="bg-white shadow-lg border-0 text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Elections Found</h3>
              <p className="text-gray-600">There are no elections matching your criteria.</p>
            </Card>
          ) : (
            filteredElections.map((election) => {
              const statusInfo = getElectionStatus(election);
              const eligibility = getVoterEligibility(election);
              const Icon = statusInfo.icon;

              return (
                <Card key={election.electionId} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-xl">{election.title}</h3>
                              {getVotingStatus(election)}
                            </div>
                            <p className="text-gray-600 mb-3">{election.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Starts: {new Date(election.startDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Ends: {new Date(election.endDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {election.candidates?.length || 0} candidates
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {getTimeRemaining(election)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar for Running Elections */}
                        {statusInfo.status === 'running' && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Voting Progress</span>
                              <span>{getTimeRemaining(election)}</span>
                            </div>
                            <Progress 
                              value={(() => {
                                const now = new Date();
                                const start = new Date(election.startDate);
                                const end = new Date(election.endDate);
                                const total = end - start;
                                const elapsed = now - start;
                                return Math.min((elapsed / total) * 100, 100);
                              })()}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 lg:w-48">
                        <Button
                          onClick={() => handleVoteClick(election)}
                          disabled={!eligibility.eligible}
                          className={`
                            ${eligibility.eligible 
                              ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
                          `}
                        >
                          <Vote className="w-4 h-4 mr-2" />
                          {hasVoted(election.electionId) ? 'View Vote' : 'Cast Vote'}
                        </Button>
                        
                        <Button variant="outline" className="justify-center">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        {!eligibility.eligible && (
                          <p className="text-xs text-gray-500 text-center">
                            {eligibility.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Voting Guide */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Vote className="w-5 h-5" />
              Voting Instructions
            </CardTitle>
            <CardDescription className="text-blue-700">
              How to participate in elections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <p>Find an active election from the list above</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <p>Click "Cast Vote" to view candidates and make your selection</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <p>Confirm your vote - you can only vote once per election</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default VoterElections;
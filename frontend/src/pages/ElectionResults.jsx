import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import API from '@/services/api';
import {
  Trophy,
  Users,
  Vote,
  TrendingUp,
  Download,
  Share2,
  Calendar,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';

const ElectionResults = () => {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (electionId) {
      fetchElectionResults();
    }
  }, [electionId]);

  const fetchElectionResults = async () => {
    try {
      setLoading(true);
      const [electionRes, resultsRes] = await Promise.all([
        API.get(`/election/${electionId}`),
        API.get(`/election/${electionId}/results/enhanced`)
      ]);

      setElection(electionRes.data?.data || electionRes.data);
      setResults(resultsRes.data?.data || resultsRes.data);
    } catch (error) {
      console.error('Failed to fetch election results:', error);
      toast({
        title: "Failed to load election results",
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

    if (start > now) return { status: 'upcoming', color: 'bg-purple-100 text-purple-800' };
    if (start <= now && now <= end) return { status: 'running', color: 'bg-green-100 text-green-800' };
    return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
  };

  const getWinnerBadge = (candidate, winner) => {
    if (candidate.candidateId === winner?.candidateId) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-0">
          <Trophy className="w-3 h-3 mr-1" />
          Winner
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading election results...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Election not found</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getElectionStatus(election);
  const totalVotes = results?.totalVotes || 0;
  const winner = results?.winner;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
              <Badge className={`${statusInfo.color} border-0`}>
                {statusInfo.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-600 text-lg">{election.description}</p>
            
            <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Start: {new Date(election.startDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                End: {new Date(election.endDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Candidates: {election.candidates?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <Vote className="w-4 h-4" />
                Total Votes: {totalVotes.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Election Winner: {winner.candidateName}
                  </h2>
                  <p className="text-gray-700">
                    Won with {winner.voteCount} votes ({Math.round((winner.voteCount / totalVotes) * 100)}% of total votes)
                  </p>
                </div>
                <Award className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results List */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  Results Breakdown
                </CardTitle>
                <CardDescription>Detailed vote counts for each candidate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results?.candidates?.map((candidate, index) => {
                    const votePercentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                    return (
                      <div key={candidate.candidateId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-teal-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{candidate.candidateName}</h3>
                              {getWinnerBadge(candidate, winner)}
                            </div>
                            <p className="text-sm text-gray-600">{candidate.party || 'Independent'}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-900">{candidate.voteCount}</span>
                            <span className="text-sm text-gray-600">votes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            {votePercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Turnout Rate */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Voter Turnout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {results?.turnoutRate ? `${results.turnoutRate}%` : 'N/A'}
                  </div>
                  <Progress value={results?.turnoutRate || 0} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2">Participation Rate</p>
                </div>
              </CardContent>
            </Card>

            {/* Vote Distribution */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Vote Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results?.candidates?.slice(0, 3).map((candidate, index) => {
                    const votePercentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                    return (
                      <div key={candidate.candidateId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                          <span className="text-sm font-medium">{candidate.candidateName}</span>
                        </div>
                        <span className="text-sm text-gray-600">{votePercentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Election Timeline */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Election Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Start Date</span>
                    <span className="text-sm font-medium">{new Date(election.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">End Date</span>
                    <span className="text-sm font-medium">{new Date(election.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={`${statusInfo.color} border-0`}>
                      {statusInfo.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ElectionResults;
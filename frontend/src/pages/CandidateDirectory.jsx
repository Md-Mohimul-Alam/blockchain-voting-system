import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import API from '@/services/api';
import {
  Users,
  Search,
  Filter,
  Vote,
  Award,
  MapPin,
  Building,
  ExternalLink,
  RefreshCw,
  Star
} from 'lucide-react';

const CandidateDirectory = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedElection, setSelectedElection] = useState('');
  const [elections, setElections] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesRes, electionsRes] = await Promise.all([
        API.get('/candidates/all'),
        API.get('/elections')
      ]);

      setCandidates(candidatesRes.data?.data || []);
      setElections(electionsRes.data?.data || electionsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Failed to load candidate directory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.biography?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesElection = !selectedElection || candidate.electionId === selectedElection;
    return matchesSearch && matchesElection;
  });

  const getElectionName = (electionId) => {
    const election = elections.find(e => e.electionId === electionId);
    return election ? election.title : 'Unknown Election';
  };

  const getPerformanceBadge = (candidate) => {
    if (candidate.voteCount > 1000) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-0">
          <Star className="w-3 h-3 mr-1" />
          Popular
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
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading candidate directory...</p>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-teal-600" />
            Candidate Directory
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the candidates running in various elections. Learn about their platforms, experience, and vision.
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search candidates by name, party, or biography..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                >
                  <option value="">All Elections</option>
                  {elections.map(election => (
                    <option key={election.electionId} value={election.electionId}>
                      {election.title}
                    </option>
                  ))}
                </select>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCandidates.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-white shadow-lg border-0 text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Found</h3>
                <p className="text-gray-600">No candidates match your search criteria.</p>
              </Card>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <Card key={candidate.candidateId} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{candidate.fullName}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{candidate.party || 'Independent'}</span>
                    </div>
                    {getPerformanceBadge(candidate)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {candidate.biography || 'No biography available.'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Vote className="w-4 h-4 text-green-600" />
                        {candidate.voteCount || 0} votes
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-blue-600" />
                        {candidate.electionsParticipated || 1} elections
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      Running in: <strong>{getElectionName(candidate.electionId)}</strong>
                    </div>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Statistics */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Directory Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{candidates.length}</p>
                <p className="text-sm text-blue-600">Total Candidates</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {new Set(candidates.map(c => c.party)).size}
                </p>
                <p className="text-sm text-green-600">Political Parties</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">
                  {elections.length}
                </p>
                <p className="text-sm text-purple-600">Active Elections</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">
                  {candidates.filter(c => c.voteCount > 1000).length}
                </p>
                <p className="text-sm text-orange-600">Popular Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateDirectory;
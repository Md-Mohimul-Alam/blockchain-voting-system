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
  User,
  Award,
  Vote,
  TrendingUp,
  Calendar,
  Edit3,
  Save,
  X,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      const [profileRes, electionsRes] = await Promise.all([
        API.get(`/candidate/${user.did}`),
        API.get('/candidacy/applications/all')
      ]);

      setProfile(profileRes.data?.data || profileRes.data);
      setEditedProfile(profileRes.data?.data || profileRes.data);
      setElections(electionsRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      toast({
        title: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await API.put('/candidate/profile', editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your candidate profile has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (start > now) return { status: 'upcoming', color: 'bg-purple-100 text-purple-800', icon: Clock };
    if (start <= now && now <= end) return { status: 'running', color: 'bg-green-100 text-green-800', icon: TrendingUp };
    return { status: 'completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
  };

  const getApplicationStatus = (electionId) => {
    const application = elections.find(app => app.electionId === electionId);
    if (!application) return null;

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: X }
    };
    
    const config = statusConfig[application.status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidate profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Candidate profile not found</p>
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <User className="w-8 h-8 text-teal-600" />
              Candidate Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your candidate information and track your applications</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancelEdit} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={editedProfile.fullName || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={editedProfile.email || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                  {isEditing ? (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={4}
                      value={editedProfile.biography || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, biography: e.target.value})}
                      placeholder="Tell voters about yourself, your experience, and your vision..."
                    />
                  ) : (
                    <p className="text-gray-900">{profile.biography || 'No biography provided.'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Political Party</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={editedProfile.party || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, party: e.target.value})}
                      placeholder="Your political affiliation"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.party || 'Independent'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Election Applications */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Election Applications
                </CardTitle>
                <CardDescription>Your candidate applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {elections.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No election applications found.</p>
                  ) : (
                    elections.map((election) => {
                      const statusInfo = getElectionStatus(election);
                      const Icon = statusInfo.icon;
                      return (
                        <div
                          key={election.electionId}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{election.electionTitle}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(election.startDate).toLocaleDateString()}
                                </span>
                                {election.manifesto && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Manifesto Submitted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${statusInfo.color} border-0`}>
                              {statusInfo.status}
                            </Badge>
                            {getApplicationStatus(election.electionId)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{profile.fullName}</h3>
                  <p className="text-sm text-gray-600">{profile.party || 'Independent'}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Applications</span>
                    <Badge variant="secondary">{elections.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approved</span>
                    <Badge variant="secondary">
                      {elections.filter(e => e.status === 'approved').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <Badge variant="secondary">
                      {elections.filter(e => e.status === 'pending').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Application Success Rate</span>
                    <span className="text-sm font-bold text-green-600">
                      {elections.length > 0 
                        ? `${Math.round((elections.filter(e => e.status === 'approved').length / elections.length) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <Progress 
                    value={elections.length > 0 ? (elections.filter(e => e.status === 'approved').length / elections.length) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <Award className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-teal-700">Active Candidate</p>
                  <p className="text-xs text-teal-600">Ready for elections</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Vote className="w-4 h-4 mr-2" />
                  Campaign Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Update Manifesto
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateProfile;
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import API from '@/services/api';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Clock,
  History,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const ElectionCalendar = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await API.get('/elections/calendar');
      setElections(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      toast({
        title: "Failed to load election calendar",
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

    if (start > now) return { status: 'upcoming', color: 'bg-purple-100 text-purple-800', icon: Clock };
    if (start <= now && now <= end) return { status: 'running', color: 'bg-green-100 text-green-800', icon: PlayCircle };
    return { status: 'completed', color: 'bg-gray-100 text-gray-800', icon: History };
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getElectionsForDay = (day) => {
    return elections.filter(election => {
      const electionDate = new Date(election.startDate);
      return electionDate.getDate() === day && 
             electionDate.getMonth() === currentDate.getMonth() &&
             electionDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const filteredElections = elections.filter(election => {
    if (filter === 'all') return true;
    const status = getElectionStatus(election).status;
    return status === filter;
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading election calendar...</p>
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
              <Calendar className="w-8 h-8 text-teal-600" />
              Election Calendar
            </h1>
            <p className="text-gray-600 mt-2">View all scheduled elections and important dates</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Calendar
            </Button>
            <Button onClick={fetchElections} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Elections</option>
                  <option value="running">Running</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="flex-1"></div>
              <div className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-24 border border-gray-200 bg-gray-50"></div>
                  ))}
                  
                  {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                    const day = index + 1;
                    const dayElections = getElectionsForDay(day);
                    return (
                      <div
                        key={day}
                        className="h-24 border border-gray-200 p-1 overflow-y-auto"
                      >
                        <div className="text-sm font-semibold mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayElections.slice(0, 2).map(election => {
                            const statusInfo = getElectionStatus(election);
                            const Icon = statusInfo.icon;
                            return (
                              <div
                                key={election.electionId}
                                className={`text-xs p-1 rounded ${statusInfo.color} truncate`}
                                title={election.title}
                              >
                                <Icon className="w-3 h-3 inline mr-1" />
                                {election.title}
                              </div>
                            );
                          })}
                          {dayElections.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayElections.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Elections List */}
          <div>
            <Card className="bg-white shadow-lg border-0 sticky top-8">
              <CardHeader>
                <CardTitle>Upcoming Elections</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredElections
                    .filter(election => {
                      const electionDate = new Date(election.startDate);
                      const today = new Date();
                      const nextWeek = new Date(today);
                      nextWeek.setDate(today.getDate() + 7);
                      return electionDate >= today && electionDate <= nextWeek;
                    })
                    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                    .slice(0, 5)
                    .map(election => {
                      const statusInfo = getElectionStatus(election);
                      const Icon = statusInfo.icon;
                      return (
                        <div
                          key={election.electionId}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {election.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(election.startDate).toLocaleDateString()} • {election.candidates?.length || 0} candidates
                            </p>
                          </div>
                          <Badge className={`${statusInfo.color} border-0 text-xs`}>
                            {statusInfo.status}
                          </Badge>
                        </div>
                      );
                    })}
                  
                  {filteredElections.filter(election => {
                    const electionDate = new Date(election.startDate);
                    const today = new Date();
                    const nextWeek = new Date(today);
                    nextWeek.setDate(today.getDate() + 7);
                    return electionDate >= today && electionDate <= nextWeek;
                  }).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No upcoming elections in the next 7 days</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-6 bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Calendar Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Running Elections</span>
                    <Badge variant="secondary">
                      {elections.filter(e => getElectionStatus(e).status === 'running').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Upcoming Elections</span>
                    <Badge variant="secondary">
                      {elections.filter(e => getElectionStatus(e).status === 'upcoming').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed Elections</span>
                    <Badge variant="secondary">
                      {elections.filter(e => getElectionStatus(e).status === 'completed').length}
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

export default ElectionCalendar;
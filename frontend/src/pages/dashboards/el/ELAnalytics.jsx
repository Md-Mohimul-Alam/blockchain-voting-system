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
  BarChart3,
  TrendingUp,
  Users,
  Vote,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  PieChart,
  Activity,
  Target,
  Award
} from 'lucide-react';

const ELAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [electionsRes, votesRes, usersRes, performanceRes] = await Promise.all([
        API.get('/elections'),
        API.get('/vote/total'),
        API.get('/users/all'),
        API.get('/analytics/system')
      ]);

      const elections = electionsRes.data?.data || [];
      const totalVotes = votesRes.data?.totalVotes || 0;
      const totalUsers = usersRes.data?.count || usersRes.data?.data?.length || 0;
      const performance = performanceRes.data?.data || {};

      // Calculate analytics
      const now = new Date();
      const runningElections = elections.filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return start <= now && now <= end;
      }).length;

      const upcomingElections = elections.filter(e => new Date(e.startDate) > now).length;
      const completedElections = elections.filter(e => new Date(e.endDate) < now).length;

      const avgTurnout = elections.length > 0 
        ? Math.round((totalVotes / (totalUsers * elections.length)) * 100) 
        : 0;

      setAnalytics({
        totalElections: elections.length,
        runningElections,
        upcomingElections,
        completedElections,
        totalVotes,
        totalUsers,
        avgTurnout,
        performance: {
          uptime: performance.uptime || '99.9%',
          responseTime: performance.responseTime || '120ms',
          successRate: performance.successRate || '98.5%'
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Failed to load analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, description, icon: Icon, trend }) => (
    <Card className="bg-white shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'transform rotate-180' : ''}`} />
                {Math.abs(trend)}% from last period
              </div>
            )}
          </div>
          <div className="p-3 bg-teal-100 rounded-full">
            <Icon className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
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
              <BarChart3 className="w-8 h-8 text-teal-600" />
              Election Analytics
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Elections"
            value={analytics.totalElections}
            description="All time"
            icon={Calendar}
            trend={5}
          />
          <StatCard
            title="Running Elections"
            value={analytics.runningElections}
            description="Active now"
            icon={Activity}
            trend={2}
          />
          <StatCard
            title="Total Votes"
            value={analytics.totalVotes.toLocaleString()}
            description="All votes cast"
            icon={Vote}
            trend={12}
          />
          <StatCard
            title="Avg. Turnout"
            value={`${analytics.avgTurnout}%`}
            description="Participation rate"
            icon={Target}
            trend={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm font-bold text-green-600">{analytics.performance.uptime}</span>
                </div>
                <Progress value={99.9} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm font-bold text-blue-600">{analytics.performance.responseTime}</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm font-bold text-purple-600">{analytics.performance.successRate}</span>
                </div>
                <Progress value={98.5} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Election Distribution */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Election Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Running</span>
                  </div>
                  <Badge variant="secondary">{analytics.runningElections}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Upcoming</span>
                  </div>
                  <Badge variant="secondary">{analytics.upcomingElections}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Completed</span>
                  </div>
                  <Badge variant="secondary">{analytics.completedElections}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
            <CardDescription>Download comprehensive analytics reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export PDF Report
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ELAnalytics;
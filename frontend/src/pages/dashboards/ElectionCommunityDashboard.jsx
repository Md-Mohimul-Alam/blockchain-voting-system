import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Calendar, 
  Users, 
  Settings, 
  PlayCircle, 
  Clock, 
  History, 
  PlusCircle,
  UserCog,
  RefreshCw,
  BarChart3,
  Shield,
  Vote,
  TrendingUp,
  AlertTriangle,
  Building2,
  Zap,
  FileText,
  ShieldCheck,
  Cpu,
  Database,
  Server,
  Lock,
  Activity,
  Bell,
  Wand2,
  Network,
  UserCheck,
  FileBarChart,
  AlertCircle,
  Archive
} from 'lucide-react';
import BarChart from '@/components/ui/bar';

// Modal Component
const ElectionModal = ({ election, isOpen, closeModal, onManageElection }) => {
  if (!isOpen) return null;

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (start > now) return { status: 'upcoming', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (start <= now && now <= end) return { status: 'running', color: 'text-green-600', bgColor: 'bg-green-100' };
    return { status: 'ended', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const statusInfo = getElectionStatus(election);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{election.title}</h2>
              <Badge className={`mt-2 ${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                {statusInfo.status.toUpperCase()}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{election.description || "No description available."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Start Date</h4>
                <p className="text-gray-900 font-semibold">
                  {new Date(election.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Time Remaining</h4>
                <p className="text-blue-600 font-semibold">
                  {statusInfo.status === 'running' ? 'Active' : 
                   statusInfo.status === 'upcoming' ? 'Not Started' : 'Completed'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">End Date</h4>
                <p className="text-gray-900 font-semibold">
                  {new Date(election.endDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Total Candidates</h4>
                <p className="text-gray-900 font-semibold">
                  {election.candidates?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {election.votes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Voting Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Votes:</span>
                  <p className="font-semibold text-gray-900">{election.votes.length}</p>
                </div>
                <div>
                  <span className="text-gray-600">Voter Turnout:</span>
                  <p className="font-semibold text-green-600">
                    {Math.round((election.votes.length / (election.voters?.length || 1)) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => {
                onManageElection(election);
                closeModal();
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Election
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, description, loading }) => (
  <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// System Metric Component
const SystemMetric = ({ title, value, icon, progress, status, loading }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      {status && !loading && status !== "Loading..." && status !== "Unknown" && (
        <Badge variant={
          status === "Excellent" || status === "Good" || status === "Secure" || status === "Healthy" ? "success" :
          status === "Fair" || status === "Warning" ? "warning" : "destructive"
        } className="text-xs">
          {status}
        </Badge>
      )}
    </div>
    <div className="text-lg font-semibold text-gray-900 mb-2">
      {loading ? (
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        value
      )}
    </div>
    {progress !== undefined && !loading && progress > 0 && (
      <Progress 
        value={progress} 
        className={`h-2 ${
          progress >= 80 ? "bg-green-100" :
          progress >= 60 ? "bg-yellow-100" :
          "bg-red-100"
        }`}
      />
    )}
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, action, disabled, path, category }) => (
  <Card className={`group bg-white border border-gray-200 hover:border-blue-300 transition-all duration-200 ${
    disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
  }`}>
    <CardContent className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg ${
          category === 'election' ? 'bg-blue-50 text-blue-600' :
          category === 'user' ? 'bg-green-50 text-green-600' :
          category === 'security' ? 'bg-red-50 text-red-600' :
          'bg-gray-50 text-gray-600'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </div>
      <Button 
        variant={disabled ? "secondary" : "default"}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white"
        onClick={path ? () => navigate(path) : action}
        disabled={disabled}
      >
        Manage
      </Button>
    </CardContent>
  </Card>
);

// Election Card Component
const ElectionCard = ({ election, onClick }) => {
  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (start > now) return { status: 'Upcoming', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Clock };
    if (start <= now && now <= end) return { status: 'Running', color: 'text-green-600', bgColor: 'bg-green-100', icon: PlayCircle };
    return { status: 'Ended', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: History };
  };

  const statusInfo = getElectionStatus(election);
  const StatusIcon = statusInfo.icon;

  return (
    <Card 
      className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.status}
          </Badge>
          <div className="text-xs text-gray-500">
            {new Date(election.startDate).toLocaleDateString()}
          </div>
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
          {election.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {election.description || "No description available."}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {election.candidates?.length || 0} candidates
            </span>
            <span className="flex items-center gap-1">
              <Vote className="w-3 h-3" />
              {election.votes?.length || 0} votes
            </span>
          </div>
          <Button size="sm" variant="ghost" className="text-teal-600 hover:text-teal-700">
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ElectionCommunityDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeElections: 0,
    pendingRequests: 0,
    totalVotes: 0
  });
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: "Loading...",
    responseTime: "Loading...",
    storage: "Loading...",
    securityScore: 0,
    overallStatus: "Loading...",
    storagePercentage: 0,
    totalOperations: 0,
    failedLogins: 0
  });
  const [networkStatus, setNetworkStatus] = useState('checking');

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    await Promise.all([
      fetchElections(),
      fetchSystemStats(),
      fetchSystemMetrics(),
      checkNetworkHealth()
    ]);
    setLoading(false);
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchElections(),
      fetchSystemStats(),
      fetchSystemMetrics(),
      checkNetworkHealth()
    ]);
    setIsRefreshing(false);
    toast({
      title: "Dashboard Updated",
      description: "All system data has been refreshed.",
    });
  };

  const checkNetworkHealth = async () => {
    try {
      await API.get('/health');
      setNetworkStatus('healthy');
    } catch (error) {
      setNetworkStatus('unhealthy');
    }
  };

  const fetchElections = async () => {
    try {
      const res = await API.get('/elections');
      setElections(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      toast({ 
        title: "Failed to fetch elections", 
        description: "Please check your connection and try again.",
        variant: "destructive" 
      });
    }
  };

  const fetchSystemStats = async () => {
    try {
      const [usersRes, electionsRes, requestsRes, votesRes] = await Promise.allSettled([
        API.get('/users/all'),
        API.get('/elections/running'),
        API.get('/candidacy/applications/pending'),
        API.get('/vote/total')
      ]);

      const totalUsers = usersRes.status === 'fulfilled' 
        ? (usersRes.value.data.count || usersRes.value.data.data?.length || 0)
        : 0;

      const activeElections = electionsRes.status === 'fulfilled'
        ? (electionsRes.value.data.count || electionsRes.value.data.data?.length || 0)
        : 0;

      const pendingRequests = requestsRes.status === 'fulfilled'
        ? (requestsRes.value.data.count || requestsRes.value.data.data?.length || 0)
        : 0;

      const totalVotes = votesRes.status === 'fulfilled'
        ? (votesRes.value.data.totalVotes || votesRes.value.data.data?.totalVotes || 0)
        : 0;

      setSystemStats({
        totalUsers,
        activeElections,
        pendingRequests,
        totalVotes
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const response = await API.get('/metrics/all');
      const metrics = response.data.data;

      if (metrics && Object.keys(metrics).length > 0) {
        let rawSecurityScore = metrics.security?.securityScore || metrics.calculated?.securityScore || 0;
        const cappedSecurityScore = Math.max(0, Math.min(100, rawSecurityScore));

        setSystemMetrics({
          uptime: metrics.uptime?.uptime || metrics.performance?.successRate || "Unknown",
          responseTime: metrics.performance?.averageResponseTime || metrics.performance?.responseTime || "Unknown",
          storage: `${metrics.storage?.used || "Unknown"}/${metrics.storage?.total || "Unknown"}`,
          securityScore: cappedSecurityScore,
          overallStatus: metrics.health?.overallStatus || metrics.health?.overall || "Unknown",
          storagePercentage: metrics.storage?.percentage || metrics.storage?.storagePercentage || 0,
          totalOperations: metrics.performance?.totalOperations || metrics.business?.totalTransactions || 0,
          failedLogins: metrics.security?.failedLogins || metrics.security?.failedLoginAttempts || 0
        });
      }
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  const categorizeElections = () => {
    const now = new Date();
    const upcoming = [], running = [], ended = [];

    elections.forEach(e => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);

      if (start > now) {
        upcoming.push(e);
      } else if (start <= now && now <= end) {
        running.push(e);
      } else {
        ended.push(e);
      }
    });

    return { upcoming, running, ended };
  };

  const { upcoming, running, ended } = categorizeElections();

  const stats = [
    {
      title: "Total Users",
      value: systemStats.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-blue-500",
      description: "Registered accounts"
    },
    {
      title: "Active Elections",
      value: systemStats.activeElections.toString(),
      icon: Vote,
      color: "bg-green-500",
      description: "In progress"
    },
    {
      title: "Pending Requests",
      value: systemStats.pendingRequests.toString(),
      icon: UserCheck,
      color: "bg-purple-500",
      description: "Awaiting approval"
    },
    {
      title: "Total Votes",
      value: systemStats.totalVotes.toLocaleString(),
      icon: TrendingUp,
      color: "bg-teal-500",
      description: "All-time count"
    }
  ];

  const quickActions = [
    {
      title: "Create Election",
      description: "Configure and launch new voting events",
      icon: Settings,
      color: "bg-blue-500",
      action: () => navigate('/el/create-election')
    },
    {
      title: "Manage Users",
      description: "View and manage all system users",
      icon: UserCog,
      color: "bg-green-500",
      action: () => navigate('/el/users')
    },
    {
      title: "Candidate Applications",
      description: "Review and process candidate requests",
      icon: Wand2,
      color: "bg-purple-500",
      action: () => navigate('/el/requests')
    },
    {
      title: "System Analytics",
      description: "View detailed system reports",
      icon: TrendingUp,
      color: "bg-teal-500",
      action: () => navigate('/el/analytics')
    }
  ];

  const handleManageElection = (election) => {
    navigate(`/el/election-management/${election.electionId}`);
  };

  const handleSystemReset = async () => {
    if (window.confirm("⚠️ CRITICAL ACTION: This will permanently delete ALL election data, user records, and voting history. This action cannot be undone. Are you absolutely sure?")) {
      try {
        await API.post('/system/reset');
        toast({
          title: "System Reset Complete",
          description: "All data has been cleared and system has been reset.",
        });
        initializeDashboard();
      } catch (error) {
        toast({
          title: "Reset Failed",
          description: "Failed to reset system. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleArchiveElections = async () => {
    try {
      await API.post('/system/archive-elections');
      toast({
        title: "Elections Archived",
        description: "Completed elections have been archived successfully.",
      });
      fetchElections();
    } catch (error) {
      toast({
        title: "Archive Failed",
        description: "Failed to archive elections.",
        variant: "destructive",
      });
    }
  };

  const getNetworkStatusBadge = () => {
    switch(networkStatus) {
      case 'healthy':
        return (
          <Badge variant="success" className="px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Network className="w-4 h-4" />
              <span className="font-medium">Blockchain Network: Operational</span>
            </div>
          </Badge>
        );
      case 'unhealthy':
        return (
          <Badge variant="destructive" className="px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Blockchain Network: Degraded</span>
            </div>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <Shield className="w-4 h-4" />
              <span className="font-medium">Verifying Network Status</span>
            </div>
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8" />
                <h1 className="text-4xl font-bold">Election Control Center</h1>
              </div>
              <p className="text-xl opacity-90 mb-2">
                Welcome back, <span className="font-semibold">{userData?.fullName || userData?.username}</span>
              </p>
              <p className="opacity-80">Manage elections and monitor system activity</p>
            </div>
            <div className="flex items-center gap-3">
              {getNetworkStatusBadge()}
              <Button 
                onClick={refreshDashboard}
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 flex-grow">
        {/* System Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SystemMetric
            title="System Uptime"
            value={systemMetrics.uptime}
            icon={<Server className="w-4 h-4 text-green-600" />}
            status={systemMetrics.overallStatus}
            loading={isRefreshing}
          />
          <SystemMetric
            title="Avg Response"
            value={systemMetrics.responseTime}
            icon={<Cpu className="w-4 h-4 text-blue-600" />}
            loading={isRefreshing}
          />
          <SystemMetric
            title="Storage Used"
            value={systemMetrics.storage}
            icon={<Database className="w-4 h-4 text-purple-600" />}
            progress={systemMetrics.storagePercentage}
            loading={isRefreshing}
          />
          <SystemMetric
            title="Security Score"
            value={`${systemMetrics.securityScore}/100`}
            icon={<Lock className="w-4 h-4 text-green-600" />}
            progress={systemMetrics.securityScore}
            loading={isRefreshing}
          />
        </div>

        {/* Statistics Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} loading={isRefreshing} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index}
                  className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={action.action}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* BarChart Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Election Analytics
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <BarChart
              total={elections.length}
              upcoming={upcoming.length}
              running={running.length}
              previous={ended.length}
            />
          </div>
        </section>

        {/* Election Management Sections */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Vote className="w-6 h-6" />
            Election Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <FeatureCard
              icon={<Settings className="w-5 h-5" />}
              title="Create Election"
              description="Configure and launch new voting events with comprehensive security settings."
              action={() => navigate('/el/create-election')}
              disabled={networkStatus !== 'healthy'}
              category="election"
            />
            <FeatureCard
              icon={<Vote className="w-5 h-5" />}
              title="Election Oversight"
              description="Monitor active elections, manage timelines, and oversee voting processes."
              path="/el/election-management"
              category="election"
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Performance Analytics"
              description="Detailed reports and analytics on election participation and outcomes."
              path="/el/analytics"
              category="election"
            />
          </div>
        </section>

        {/* Election Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Running Elections */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Running Elections</h2>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                {running.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {running.length === 0 ? (
                <Card className="bg-white border-0 text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No running elections</p>
                </Card>
              ) : (
                running.map((election, index) => (
                  <ElectionCard
                    key={index}
                    election={election}
                    onClick={() => {
                      setSelectedElection(election);
                      setIsModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </section>

          {/* Upcoming Elections */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Upcoming Elections</h2>
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                {upcoming.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {upcoming.length === 0 ? (
                <Card className="bg-white border-0 text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming elections</p>
                </Card>
              ) : (
                upcoming.map((election, index) => (
                  <ElectionCard
                    key={index}
                    election={election}
                    onClick={() => {
                      setSelectedElection(election);
                      setIsModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </section>

          {/* Ended Elections */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Past Elections</h2>
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-800">
                {ended.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {ended.length === 0 ? (
                <Card className="bg-white border-0 text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No past elections</p>
                </Card>
              ) : (
                ended.map((election, index) => (
                  <ElectionCard
                    key={index}
                    election={election}
                    onClick={() => {
                      setSelectedElection(election);
                      setIsModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* System Management */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-12"
                onClick={handleArchiveElections}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive Ended Elections
              </Button>
              <Button 
                variant="destructive" 
                className="justify-start h-12"
                onClick={handleSystemReset}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                System Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Election Modal */}
      <ElectionModal
        election={selectedElection}
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        onManageElection={handleManageElection}
      />

      <Footer />
    </div>
  );
};

export default ElectionCommunityDashboard;
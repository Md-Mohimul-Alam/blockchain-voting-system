// Updated AdminDashboard.jsx - Professional Corporate Design with Real Metrics ONLY
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, Users, RefreshCcw, BarChart4, FileText, 
  AlertTriangle, Vote, Wand2, Network, Shield, Zap,
  UserCheck, TrendingUp, ShieldCheck, Bell, Building2,
  Cpu, Database, Server, Lock, Activity, HardDrive
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import API from "@/services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeElections: 0,
    pendingRequests: 0,
    totalVotes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setIsLoading(true);
    await checkNetworkHealth();
    await fetchSystemStats();
    await fetchSystemMetrics();
    setIsLoading(false);
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await Promise.all([
      checkNetworkHealth(),
      fetchSystemStats(),
      fetchSystemMetrics()
    ]);
    setIsRefreshing(false);
    toast({
      title: "Dashboard Updated",
      description: "All system data has been refreshed.",
    });
  };

  const checkNetworkHealth = async () => {
    try {
      const response = await API.get('/health');
      setNetworkStatus('healthy');
    } catch (error) {
      setNetworkStatus('unhealthy');
      console.error('Network health check failed:', error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      console.log('🔄 Fetching system statistics...');
      
      // Use Promise.allSettled to handle potential failures gracefully
      const [usersRes, electionsRes, requestsRes, votesRes] = await Promise.allSettled([
        API.get('/users/all').catch(() => ({ data: { data: [], count: 0 } })),
        API.get('/elections/running').catch(() => ({ data: { data: [], count: 0 } })),
        API.get('/candidacy/applications/pending').catch(() => ({ data: { data: [], count: 0 } })),
        API.get('/vote/total').catch(() => ({ data: { totalVotes: 0 } }))
      ]);

      console.log('📊 System stats responses:', {
        users: usersRes,
        elections: electionsRes,
        requests: requestsRes,
        votes: votesRes
      });

      // Extract data with fallbacks
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

      const updatedStats = {
        totalUsers,
        activeElections,
        pendingRequests,
        totalVotes
      };

      console.log('✅ Final system stats:', updatedStats);
      setSystemStats(updatedStats);

    } catch (error) {
      console.error('❌ Error fetching system stats:', error);
      
      // Set fallback stats with detailed error info
      const fallbackStats = {
        totalUsers: 0,
        activeElections: 0,
        pendingRequests: 0,
        totalVotes: 0
      };
      
      setSystemStats(fallbackStats);
      
      toast({
        title: "Data Fetch Error",
        description: "Could not load some system statistics. Showing available data only.",
        variant: "destructive",
      });
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      console.log('📊 Fetching system metrics...');
      
      // Try the main metrics endpoint first
      const response = await API.get('/metrics/all');
      const metrics = response.data.data;

      console.log('📈 Full metrics response:', metrics);

      if (metrics && Object.keys(metrics).length > 0) {
        // FIX: Properly handle security score with bounds checking
        let rawSecurityScore = metrics.security?.securityScore || metrics.calculated?.securityScore || 0;
        
        // Ensure security score is between 0-100
        const cappedSecurityScore = Math.max(0, Math.min(100, rawSecurityScore));
        
        // Log if we had to cap the score
        if (rawSecurityScore !== cappedSecurityScore) {
          console.warn(`⚠️ Security score capped from ${rawSecurityScore} to ${cappedSecurityScore}`);
        }

        const updatedMetrics = {
          uptime: metrics.uptime?.uptime || metrics.performance?.successRate || "Unknown",
          responseTime: metrics.performance?.averageResponseTime || metrics.performance?.responseTime || "Unknown",
          storage: `${metrics.storage?.used || "Unknown"}/${metrics.storage?.total || "Unknown"}`,
          securityScore: cappedSecurityScore, // Use the properly capped score
          overallStatus: metrics.health?.overallStatus || metrics.health?.overall || "Unknown",
          storagePercentage: metrics.storage?.percentage || metrics.storage?.storagePercentage || 0,
          totalOperations: metrics.performance?.totalOperations || metrics.business?.totalTransactions || 0,
          failedLogins: metrics.security?.failedLogins || metrics.security?.failedLoginAttempts || 0
        };

        console.log('✅ Processed metrics:', updatedMetrics);
        setSystemMetrics(updatedMetrics);
      } else {
        // If no real data, show zeros/unknown
        console.log('⚠️ No metrics data available');
        setSystemMetrics({
          uptime: "No Data",
          responseTime: "No Data",
          storage: "No Data/No Data",
          securityScore: 0,
          overallStatus: "Unknown",
          storagePercentage: 0,
          totalOperations: 0,
          failedLogins: 0
        });
      }

    } catch (error) {
      console.error('❌ Error fetching real system metrics:', error);
      
      // Set safe defaults with proper validation
      setSystemMetrics({
        uptime: "Unavailable",
        responseTime: "Unavailable",
        storage: "Unavailable/Unavailable",
        securityScore: 0,
        overallStatus: "Unknown",
        storagePercentage: 0,
        totalOperations: 0,
        failedLogins: 0
      });
    }
  };

  const handleCreateElection = () => {
    if (networkStatus !== 'healthy') {
      toast({
        title: "Network Issue",
        description: "Blockchain network is not healthy. Please check network status.",
        variant: "destructive",
      });
      return;
    }
    navigate("/admin/create-election");
  };

  const handleSystemReset = async () => {
    if (window.confirm("⚠️ CRITICAL ACTION: This will permanently delete ALL election data, user records, and voting history. This action cannot be undone. Are you absolutely sure?")) {
      try {
        const response = await API.post('/system/reset');
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

  const retryNetworkCheck = () => {
    setNetworkStatus('checking');
    checkNetworkHealth();
  };

  const MetricCard = ({ icon, title, value, subtitle, loading }) => (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                value
              )}
            </div>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SystemMetric = ({ title, value, icon, progress, status, loading }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
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
      {loading && (
        <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
      )}
    </div>
  );

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing Admin Dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8 text-gray-700" />
                  <h1 className="text-3xl font-bold text-gray-900">Administration Console</h1>
                </div>
                <p className="text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">{userData?.fullName || userData?.username}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getNetworkStatusBadge()}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshDashboard}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                {networkStatus === 'unhealthy' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={retryNetworkCheck}
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Real System Metrics */}
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

          {/* Additional Metrics Info */}
          {!isRefreshing && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600">Total Operations</p>
                <div className="text-lg font-semibold text-gray-900">{systemMetrics.totalOperations.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600">Failed Logins</p>
                <div className="text-lg font-semibold text-gray-900">{systemMetrics.failedLogins}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600">Storage Used</p>
                <div className="text-lg font-semibold text-gray-900">
                  {systemMetrics.storagePercentage > 0 ? `${systemMetrics.storagePercentage}%` : 'No Data'}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600">System Status</p>
                {systemMetrics.overallStatus && systemMetrics.overallStatus !== "Unknown" && systemMetrics.overallStatus !== "Loading..." ? (
                  <Badge variant={
                    systemMetrics.overallStatus === "Excellent" || systemMetrics.overallStatus === "Good" || systemMetrics.overallStatus === "Healthy" ? "success" :
                    systemMetrics.overallStatus === "Fair" ? "warning" : "destructive"
                  } className="text-xs">
                    {systemMetrics.overallStatus}
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-500">No Data</span>
                )}
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={<Users className="w-6 h-6 text-gray-600" />}
              title="Total Users"
              value={systemStats.totalUsers.toLocaleString()}
              subtitle="Registered accounts"
              loading={isRefreshing}
            />
            <MetricCard
              icon={<Vote className="w-6 h-6 text-gray-600" />}
              title="Active Elections"
              value={systemStats.activeElections.toString()}
              subtitle="In progress"
              loading={isRefreshing}
            />
            <MetricCard
              icon={<UserCheck className="w-6 h-6 text-gray-600" />}
              title="Pending Requests"
              value={systemStats.pendingRequests.toString()}
              subtitle="Awaiting approval"
              loading={isRefreshing}
            />
            <MetricCard
              icon={<TrendingUp className="w-6 h-6 text-gray-600" />}
              title="Total Votes"
              value={systemStats.totalVotes.toLocaleString()}
              subtitle="All-time count"
              loading={isRefreshing}
            />
          </div>

          {/* Network Status Alert */}
          {networkStatus === 'unhealthy' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Blockchain Network Connectivity Issue</h3>
                  <p className="text-red-700 text-sm">
                    The system cannot establish connection with the Hyperledger Fabric network. 
                    Administrative functions requiring blockchain interaction are temporarily unavailable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Management Sections */}
          <div className="space-y-8">
            {/* Election Management */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Vote className="w-5 h-5 text-blue-600" />
                Election Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={<Settings className="w-5 h-5" />}
                  title="Create Election"
                  description="Configure and launch new voting events with comprehensive security settings."
                  action={handleCreateElection}
                  disabled={networkStatus !== 'healthy'}
                  category="election"
                />
                <FeatureCard
                  icon={<Vote className="w-5 h-5" />}
                  title="Election Oversight"
                  description="Monitor active elections, manage timelines, and oversee voting processes."
                  path="/admin/election-management"
                  category="election"
                />
                <FeatureCard
                  icon={<BarChart4 className="w-5 h-5" />}
                  title="Performance Analytics"
                  description="Detailed reports and analytics on election participation and outcomes."
                  path="/admin/analytics"
                  category="election"
                />
              </div>
            </section>

            {/* User & Candidate Management */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                User Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={<Users className="w-5 h-5" />}
                  title="User Administration"
                  description="Manage user accounts, permissions, and access controls across the platform."
                  path="/admin/manage-users"
                  category="user"
                />
                <FeatureCard
                  icon={<Wand2 className="w-5 h-5" />}
                  title="Candidate Applications"
                  description="Review and process candidate registration requests and approvals."
                  path="/admin/requests"
                  category="user"
                />
                <FeatureCard
                  icon={<UserCheck className="w-5 h-5" />}
                  title="Role Management"
                  description="Assign and manage user roles, permissions, and system access levels."
                  path="/admin/roles"
                  category="user"
                />
              </div>
            </section>

            {/* System & Security */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                System & Security
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={<FileText className="w-5 h-5" />}
                  title="Audit Logs"
                  description="Comprehensive system activity logs and transaction history review."
                  path="/admin/logs"
                  category="security"
                />
                <FeatureCard
                  icon={<AlertTriangle className="w-5 h-5" />}
                  title="Complaint Resolution"
                  description="Manage and resolve user-reported issues and platform complaints."
                  path="/admin/complaints"
                  category="security"
                />
                <FeatureCard
                  icon={<RefreshCcw className="w-5 h-5" />}
                  title="System Maintenance"
                  description="Critical system operations including data reset and recovery procedures."
                  action={handleSystemReset}
                  category="security"
                />
              </div>
              
              {/* Emergency Tools Card */}
              <Card className="mt-6 bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Emergency Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600 mb-4">
                    Reset candidate passwords for login issues
                  </p>
                  <Button 
                    onClick={() => navigate('/admin/reset-password')}
                    variant="destructive"
                    className="mr-3"
                  >
                    Reset Candidate Passwords
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/system-health')}
                  >
                    System Diagnostics
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Quick Actions Panel */}
          <Card className="mt-8 bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-12"
                  onClick={() => navigate('/admin/create-election')}
                  disabled={networkStatus !== 'healthy'}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  New Election
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-12"
                  onClick={() => navigate('/admin/requests')}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Review Requests
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-12"
                  onClick={() => navigate('/admin/logs')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-12"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <BarChart4 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health Status */}
          <Card className="mt-6 bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                System Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Blockchain Network</span>
                  <Badge variant={networkStatus === 'healthy' ? 'success' : 'destructive'}>
                    {networkStatus === 'healthy' ? 'Operational' : 'Degraded'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">System Performance</span>
                  {systemMetrics.overallStatus && systemMetrics.overallStatus !== "Unknown" && systemMetrics.overallStatus !== "Loading..." ? (
                    <Badge variant={
                      systemMetrics.overallStatus === "Excellent" || systemMetrics.overallStatus === "Good" || systemMetrics.overallStatus === "Healthy" ? "success" :
                      systemMetrics.overallStatus === "Fair" ? "warning" : "destructive"
                    }>
                      {systemMetrics.overallStatus}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-500">No Data</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Security Status</span>
                  <Badge variant={
                    systemMetrics.securityScore >= 80 ? 'success' : 
                    systemMetrics.securityScore >= 60 ? 'warning' : 
                    systemMetrics.securityScore > 0 ? 'destructive' : 'secondary'
                  }>
                    {systemMetrics.securityScore > 0 ? (
                      systemMetrics.securityScore >= 80 ? 'Secure' : 
                      systemMetrics.securityScore >= 60 ? 'Warning' : 'Critical'
                    ) : 'No Data'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Storage Health</span>
                  <Badge variant={
                    systemMetrics.storagePercentage < 80 ? 'success' : 
                    systemMetrics.storagePercentage < 90 ? 'warning' : 
                    systemMetrics.storagePercentage > 0 ? 'destructive' : 'secondary'
                  }>
                    {systemMetrics.storagePercentage > 0 ? (
                      systemMetrics.storagePercentage < 80 ? 'Healthy' : 
                      systemMetrics.storagePercentage < 90 ? 'Warning' : 'Critical'
                    ) : 'No Data'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
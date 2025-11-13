import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import API from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Bar, Pie } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from "chart.js";
import {
  Calendar,
  Users,
  Vote,
  TrendingUp,
  AlertCircle,
  Eye,
  BarChart3,
  PieChart,
  RefreshCw
} from "lucide-react";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [elections, setElections] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("bar");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching elections for analytics...");
      
      const response = await API.get("/elections");
      console.log("📨 Analytics response:", response);
      
      // Handle different response structures safely
      let electionsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        electionsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        electionsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        electionsData = [response.data];
      } else {
        console.warn("⚠️ Unexpected elections structure:", response.data);
        electionsData = [];
      }
      
      console.log(`✅ Loaded ${electionsData.length} elections for analytics`);
      setElections(electionsData);
      
    } catch (error) {
      console.error("❌ Error fetching elections for analytics:", error);
      toast({
        title: "Failed to load analytics data",
        description: error.response?.data?.error || "Please try again later",
        variant: "destructive",
      });
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe categorization function
  const categorizeElections = () => {
    if (!elections || !Array.isArray(elections)) {
      return { upcoming: [], running: [], previous: [], total: 0 };
    }

    const now = new Date();
    const upcoming = [];
    const running = [];
    const previous = [];

    elections.forEach((election) => {
      if (!election || !election.startDate || !election.endDate) {
        console.warn("⚠️ Invalid election data in analytics:", election);
        return;
      }

      try {
        const start = new Date(election.startDate);
        const end = new Date(election.endDate);

        if (start > now) {
          upcoming.push(election);
        } else if (start <= now && now <= end) {
          running.push(election);
        } else {
          previous.push(election);
        }
      } catch (dateError) {
        console.error("❌ Error parsing election dates in analytics:", dateError, election);
      }
    });

    return { 
      upcoming, 
      running, 
      previous, 
      total: elections.length 
    };
  };

  const { upcoming, running, previous, total } = categorizeElections();

  // Chart data for Bar Chart
  const barChartData = {
    labels: ['Upcoming', 'Running', 'Completed'],
    datasets: [
      {
        label: 'Number of Elections',
        data: [upcoming.length, running.length, previous.length],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for Pie Chart
  const pieChartData = {
    labels: ['Upcoming', 'Running', 'Completed'],
    datasets: [
      {
        data: [upcoming.length, running.length, previous.length],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Election Distribution',
        font: {
          size: 16
        }
      },
    },
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { variant: "secondary", label: "Upcoming" },
      running: { variant: "success", label: "Running" },
      previous: { variant: "destructive", label: "Completed" }
    };
    
    return statusConfig[status] || statusConfig.upcoming;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const ElectionCard = ({ election, status }) => {
    const config = getStatusBadge(status);
    
    return (
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-teal-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">
              {election.title}
            </h3>
            <Badge variant={config.variant}>
              {config.label}
            </Badge>
          </div>
          
          {election.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {election.description}
            </p>
          )}
          
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Start:</span>
              <span className="font-medium">{formatDate(election.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span>End:</span>
              <span className="font-medium">{formatDate(election.endDate)}</span>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/admin/election-management')}
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Election Analytics</h1>
          </div>
          <p className="text-xl opacity-90">
            Comprehensive insights and statistics for all elections
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Elections</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-bold text-gray-900">{running.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Vote className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{previous.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Election Distribution</CardTitle>
              <CardDescription>
                Visual representation of election status across the system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeChart === "bar" ? "default" : "outline"}
                onClick={() => setActiveChart("bar")}
                size="sm"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Bar Chart
              </Button>
              <Button
                variant={activeChart === "pie" ? "default" : "outline"}
                onClick={() => setActiveChart("pie")}
                size="sm"
                className="flex items-center gap-2"
              >
                <PieChart className="w-4 h-4" />
                Pie Chart
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {activeChart === "bar" ? (
                <Bar data={barChartData} options={chartOptions} />
              ) : (
                <Pie data={pieChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Election Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Running Elections */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Running Elections ({running.length})
            </h3>
            <div className="space-y-4">
              {running.length > 0 ? (
                running.map((election, idx) => (
                  <ElectionCard key={idx} election={election} status="running" />
                ))
              ) : (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No running elections</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Upcoming Elections */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Elections ({upcoming.length})
            </h3>
            <div className="space-y-4">
              {upcoming.length > 0 ? (
                upcoming.map((election, idx) => (
                  <ElectionCard key={idx} election={election} status="upcoming" />
                ))
              ) : (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No upcoming elections</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Completed Elections */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Vote className="w-5 h-5 text-red-600" />
              Completed Elections ({previous.length})
            </h3>
            <div className="space-y-4">
              {previous.length > 0 ? (
                previous.map((election, idx) => (
                  <ElectionCard key={idx} election={election} status="previous" />
                ))
              ) : (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No completed elections</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminAnalytics;
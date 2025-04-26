import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button"; // assuming you are using your UI components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import API from "@/services/api";
import { useToast } from "@/hooks/use-toast"; // Toast notifications hook
import { Bar } from "react-chartjs-2"; // Chart.js Bar chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Election Modal Component
const ElectionModal = ({ election, isOpen, closeModal }) => {
  const navigate = useNavigate(); // Use useNavigate to get the navigate function

  return (
    <div className={`fixed inset-0 z-50 bg-opacity-50 ${isOpen ? "block" : "hidden"} backdrop-blur-sm flex justify-center items-center`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 md:w-1/3">
        <h3 className="text-2xl font-semibold text-teal-700 mb-4">{election.title}</h3>
        <p><strong>Description:</strong> {election.description || "No description available."}</p>
        <div className="mt-4">
          <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
          <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
        </div>
        <div className="mt-4 flex justify-between">
          <Button
            onClick={closeModal}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Close
          </Button>
          <Button 
            onClick={() => navigate('/admin/election-management')} // Use navigate to go to the election management page
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            Manage Election
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [elections, setElections] = useState([]);
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for displaying election details
  const [selectedElection, setSelectedElection] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    API.get("/elections")
      .then((res) => setElections(res.data))
      .catch(() =>
        toast({ title: "Failed to fetch elections", variant: "destructive" })
      );
  }, []);

  const categorizeElections = () => {
    const now = new Date();
    const upcoming = [], running = [], previous = [];

    elections.forEach((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);

      if (start > now) {
        upcoming.push(e);
      } else if (start <= now && now <= end) {
        running.push(e);
      } else {
        previous.push(e);
      }
    });

    return { upcoming, running, previous };
  };

  const { upcoming, running, previous } = categorizeElections();

  // Data for the chart
  const chartData = {
    labels: ['Upcoming', 'Running', 'Previous'],
    datasets: [
      {
        label: 'Elections',
        data: [upcoming.length, running.length, previous.length], // Data for the chart
        backgroundColor: ['#4CAF50', '#FFEB3B', '#9E9E9E'], // Colors for each bar
        borderColor: ['#388E3C', '#FBC02D', '#616161'], // Border colors
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Election Status Overview',
      },
    },
  };

  // Election click handler for modal display
  const handleElectionClick = (election) => {
    setSelectedElection(election);
    setIsModalOpen(true);
  };

  return (
    <div className="">
      <Header />
      <div className="p-8 text-3xl font-bold text-center text-white bg-teal-800 shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="pl-23">Election Status Overview</CardTitle>
        </CardHeader>
      </div>
      
      {/* Election Analytics Bar Chart */}
      <div className="max-w-5xl mx-auto w-full mb-12">
        <Card>
          <CardContent className="space-y-4">
            <Bar data={chartData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>

      {/* Card Section for each type of election */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {/* Running Elections */}
        <Card className="mt-8 border-t-4 border-yellow-500">
          <CardHeader>
            <CardTitle>Running Elections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {running.length === 0 ? (
              <p className="text-gray-500 italic">No running elections available.</p>
            ) : (
              running.map((election, idx) => (
                <div
                  key={idx}
                  className="p-6 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
                  onClick={() => handleElectionClick(election)} // Trigger the action passed as prop
                >
                  <div className="block items-center">
                    <h3 className="font-semibold text-2xl text-teal-600 mb-2">{election.title}</h3>
                    <Button className="w-full text-white bg-teal-600 hover:bg-teal-700">
                      <p className="text-white">View Details</p>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Elections */}
        <Card className="mt-8 border-t-4 border-purple-500">
          <CardHeader>
            <CardTitle>Upcoming Elections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.length === 0 ? (
              <p className="text-gray-500 italic">No upcoming elections available.</p>
            ) : (
              upcoming.map((election, idx) => (
                <div
                  key={idx}
                  className="p-6 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
                  onClick={() => handleElectionClick(election)} // Trigger the action passed as prop
                >
                  <div className="block items-center">
                    <h3 className="font-semibold text-2xl text-teal-600 mb-2">{election.title}</h3>
                    <Button className="w-full text-white bg-teal-600 hover:bg-teal-700">
                      <p className="text-white">View Details</p>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Previous Elections */}
        <Card className="mt-8 border-t-4 border-gray-500">
          <CardHeader>
            <CardTitle>Previous Elections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previous.length === 0 ? (
              <p className="text-gray-500 italic">No previous elections available.</p>
            ) : (
              previous.map((election, idx) => (
                <div
                  key={idx}
                  className="p-6 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
                  onClick={() => handleElectionClick(election)} // Trigger the action passed as prop
                >
                  <div className="block items-center">
                    <h3 className="font-semibold text-2xl text-teal-600 mb-2">{election.title}</h3>
                    <Button className="w-full text-white bg-teal-600 hover:bg-teal-700">
                      <p className="text-white">View Details</p>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Election Modal */}
      {selectedElection && (
        <ElectionModal
          election={selectedElection}
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminAnalytics;

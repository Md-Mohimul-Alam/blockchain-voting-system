import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Calendar } from 'lucide-react';
import BarChart from '@/components/ui/bar';
// Modal Component
const ElectionModal = ({ election, isOpen, closeModal }) => {
  return (
    <div className={`fixed inset-0  bg-opacity-50 z-50 ${isOpen ? "block" : "hidden"} backdrop-blur-sm`}>
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 md:w-1/3">
          <h3 className="text-2xl font-semibold text-teal-700 mb-4">{election.title}</h3>
          <p><strong>Description:</strong> {election.description || "No description available."}</p>
          <div className="mt-4">
            <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
            <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
          </div>
          <div className="mt-4 flex justify-between">
            <Button onClick={closeModal} className="bg-red-500 text-white hover:bg-red-600">
              Close
            </Button>
            <Button className="bg-teal-600 text-white hover:bg-teal-700">
              Manage Election
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ElectionCommunityDashboard = () => {
  const [elections, setElections] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    API.get('/elections')
      .then(res => setElections(res.data))
      .catch(() =>
        toast({ title: "Failed to fetch elections", variant: "destructive" })
      );
  }, []);

  const categorizeElections = () => {
    const now = new Date();
    const upcoming = [], running = [], previous = [];

    elections.forEach(e => {
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

  const ElectionList = ({ title, data, color }) => (
    <Card className={`mt-8 border-t-4 ${color}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-gray-500 italic">No {title.toLowerCase()} available.</p>
        ) : (
          data.map((election, idx) => (
            <div
              key={idx}
              className="p-6 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
              onClick={() => {
                setSelectedElection(election);
                setIsModalOpen(true);
              }}
            >
              <div className="block items-center">
                <h3 className="font-semibold text-2xl text-teal-600 mb-2">{election.title}</h3>
                  <Button className="w-full text-white bg-teal-600 hover:bg-teal-700">
                    <p className="text-white">
                      View Details
                    </p>
                  </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="p-6 bg-teal-800 shadow-xl rounded-lg">
        <h1 className="text-4xl font-bold text-center mb-6 text-teal-100">
          <span className="capitalize bg-gradient-to-r from-purple-200 to-teal-200 text-transparent bg-clip-text">
            {userData?.role}
          </span>{" "}Control Panel
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-10 text-teal-800 capitalize bg-gradient-to-r from-purple-200 to-teal-200 text-transparent bg-clip-text">
          Welcome, {userData?.fullName || userData?.username}!!!!
        </h2>
      </div>

      {/* Election Modal */}
      {selectedElection && (
        <ElectionModal
          election={selectedElection}
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
        />
      )}

      <main className="flex-grow w-full px-6 py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto mb-12">
          {/* BarChart for Total Elections */}
          <BarChart
            total={elections.length}
            upcoming={upcoming.length}
            running={running.length}
            previous={previous.length}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Running Elections */}
            <ElectionList
              title="Running Elections"
              data={running}
              color="border-yellow-500 text-yellow-500"
            />

            {/* Upcoming Elections */}
            <ElectionList
              title="Upcoming Elections"
              data={upcoming}
              color="border-purple-500 text-purple-500"
            />

            {/* Previous Elections */}
            <ElectionList
              title="Previous Elections"
              data={previous}
              color="border-gray-500 text-gray-500"
            />
          </div>

          {/* Dashboard Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 mt-10">
            <Card className="bg-white shadow rounded-xl p-6 border-t-4 border-blue-600">
              <CardHeader>
                <CardTitle>Create Election</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/el/create-election')}
                >
                  Launch Election Setup
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow rounded-xl p-6 border-t-4 border-green-600">
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full text-white bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/el/users')}
                >
                  View All Users
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow rounded-xl p-6 border-t-4 border-red-600">
              <CardHeader>
                <CardTitle>System Reset</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full text-white bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to reset the system?")) {
                      try {
                        await API.post('/reset');
                        toast({ title: "System reset completed" });
                        setElections([]);
                      } catch {
                        toast({ title: "System reset failed", variant: "destructive" });
                      }
                    }
                  }}
                >
                  Reset Everything
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

export default ElectionCommunityDashboard;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from "@/services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);

  // Fetch user data from localStorage or API
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user)); // Parse the user data from localStorage
    } else {
      // Redirect to login if no user found
      navigate("/login");
    }
  }, [navigate]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data
    localStorage.removeItem("token"); // Clear token
    navigate("/login"); // Redirect to login page
  };

  // Fetch additional user-specific data (e.g., user activity, history, etc.)
  const fetchUserDetails = async () => {
    try {
      const response = await API.get(`/user/details/${userData?.id}`);
      // Assuming the user details are returned in the response
      setUserData(response.data); // Update user data with additional details
    } catch (error) {
      toast({ title: "Failed to fetch user details", variant: "destructive" });
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchUserDetails();
    }
  }, [userData]);

  return (
    <div>
      <Header />
      <div className="p-8 text-3xl font-bold text-center text-white bg-teal-800 shadow-xl mb-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-white">
          <span className="capitalize bg-gradient-to-r from-purple-500 to-teal-500 text-transparent bg-clip-text">
            {userData?.role}
          </span>{" "}
          Dashboard
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-10 text-white">
          Welcome, {userData?.fullName || userData?.username}!
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {userData?.fullName || userData?.username}</p>
            <p><strong>Email:</strong> {userData?.email}</p>
            <p><strong>Role:</strong> {userData?.role}</p>
            <p><strong>DID:</strong> {userData?.did}</p>
            <p><strong>Date of Birth:</strong> {userData?.dob}</p>
          </CardContent>
        </Card>

        {/* Role-based Dashboard Content */}
        {userData?.role === "admin" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage elections, users, candidates, and other system settings.</p>
              <Button onClick={() => navigate("/admin/manage-elections")} className="bg-teal-600 text-white hover:bg-teal-700">
                Go to Admin Panel
              </Button>
            </CardContent>
          </Card>
        )}

        {userData?.role === "voter" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Voter Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View upcoming elections and cast your vote.</p>
              <Button onClick={() => navigate("/voter/elections")} className="bg-teal-600 text-white hover:bg-teal-700">
                View Elections
              </Button>
            </CardContent>
          </Card>
        )}

        {userData?.role === "candidate" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Candidate Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View your candidacy status, election results, and more.</p>
              <Button onClick={() => navigate("/candidate/dashboard")} className="bg-teal-600 text-white hover:bg-teal-700">
                Go to Candidate Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Logout Button */}
        <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 mt-8 w-full">
          Logout
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;

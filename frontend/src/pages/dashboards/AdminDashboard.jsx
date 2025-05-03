import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Users, RefreshCcw, Calendar, BarChart4, FileText, AlertTriangle, BellRing, CopyPlus, StickyNote, Activity, ShieldCheck, Wand2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  const handleCreateElection = () => navigate("/admin/create-election");
  const handleViewUsers = () => navigate("/admin/manage-users");
  const handleSystemReset = () => {
    if (window.confirm("Are you sure you want to reset the system?")) {
      console.log("System reset triggered.");
    }
  };

  const buttonStyle = "w-full text-white flex items-center justify-center gap-2";

  const cardsData = [
    {
      title: "Create Election",
      icon: <Settings className="w-4 h-4" />,
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Set up and manage a new election securely.",
      action: handleCreateElection,
    },
    {
      title: "Manage Election",
      icon: <CopyPlus className="w-4 h-4" />,
      color: "bg-sky-600 hover:bg-sky-700",
      description: "Start & Stop or manage existing elections. Also view election details.",
      path: "/admin/election-management",
    },
    {
      title: "Election Analytics",
      icon: <BarChart4 className="w-4 h-4" />,
      color: "bg-yellow-500 hover:bg-yellow-600",
      description: "Analyze the performance of elections and their results.",
      path: "/admin/analytics",
    },
    {
      title: "Manage Users",
      icon: <Users className="w-4 h-4" />,
      color: "bg-green-600 hover:bg-green-700",
      description: "View, update or remove registered voters and candidates.",
      action: handleViewUsers,
    },
    {
      title: "Reset System",
      icon: <RefreshCcw className="w-4 h-4" />,
      color: "bg-red-600 hover:bg-red-700",
      description: "Danger zone: reset all voting data and logs.",
      action: handleSystemReset,
    },
    {
      title: "Audit Logs",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-gray-600 hover:bg-gray-700",
      description: "View the audit logs of all actions in the system.",
      path: "/admin/logs",
    },
    {
      title: "Complaints",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-orange-600 hover:bg-orange-700",
      description: "Manage and reply to user complaints.",
      path: "/admin/complaints",
    },
    {
      title: "System Health",
      icon: <Activity className="w-4 h-4" />,
      color: "bg-indigo-600 hover:bg-indigo-700",
      description: "Check the system's health and status.",
      path: "/admin/system-health",
    },
    {
      title: "Admin Team",
      icon: <ShieldCheck className="w-4 h-4" />,
      color: "bg-pink-600 hover:bg-pink-700",
      description: "View and manage the admin team.",
      path: "/admin/team",
    },
    {
      title: "Candidate Requests",
      icon: <Wand2 className="w-4 h-4" />,
      color: "bg-cyan-600 hover:bg-cyan-700",
      description: "Candidate Requests & Approval for the election  .",
      path: "/admin/Requests",
    },
    {
      title: "Send Notification",
      icon: <BellRing className="w-4 h-4" />,
      color: "bg-amber-600 hover:bg-amber-700",
      description: "Send notifications to users.",
      path: "/admin/notify",
    },
    {
      title: "Admin Notes",
      icon: <StickyNote className="w-4 h-4" />,
      color: "bg-violet-600 hover:bg-violet-700",
      description: "Create and manage admin notes.",
      path: "/admin/notes",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow w-full px-6 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6 text-teal-700">
            <span className="capitalize bg-gradient-to-r from-purple-500 to-teal-500 text-transparent bg-clip-text">
              {userData?.role}
            </span>{" "}Control Panel
          </h1>
          <h2 className="text-2xl font-semibold text-center mb-10 text-teal-800">
            Welcome, {userData?.fullName || userData?.username}!!!!
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardsData.map((card, idx) => (
              <Card key={idx} className={`bg-white shadow rounded-xl p-6 border-t-4 ${card.color.split(" ")[0].replace("bg-", "border-")}`}>
                <CardHeader className="flex items-center space-x-4 mb-4">
                  {card.icon}
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-500 mb-4">{card.description}</CardDescription>
                  {card.path ? (
                    <Button className={`${buttonStyle} ${card.color}`} onClick={() => navigate(card.path)}>
                      {card.icon}{card.title}
                    </Button>
                  ) : (
                    <Button className={`${buttonStyle} ${card.color}`} onClick={card.action}>
                      {card.icon}{card.title}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

import { useState } from "react";
import SidebarUser from "../components/SidebarUser";
import Vote from "../components/User/vote";
import Results from "../components/User/Results";
import Profile from "../components/User/profile";
import OverviewTab from "../components/User/Overview";

const UserDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("vote");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarUser selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Dynamic Content */}
        {selectedTab === "overview" && <OverviewTab />}
        {selectedTab === "vote" && <Vote />}
        {selectedTab === "results" && <Results />}
        {selectedTab === "profile" && <Profile />}
      </div>
    </div>
  );
};

export default UserDashboard;

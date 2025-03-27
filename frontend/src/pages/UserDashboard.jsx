import { useState } from "react";
import SidebarUser from "../components/SidebarUser";

const UserDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("vote");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarUser setSelectedTab={setSelectedTab} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>

        {/* Dynamic Content */}
        {selectedTab === "vote" && <p>Select a candidate and cast your vote.</p>}
        {selectedTab === "results" && <p>View live election results here.</p>}
        {selectedTab === "profile" && <p>Update your personal details.</p>}
      </div>
    </div>
  );
};

export default UserDashboard;

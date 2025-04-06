import { FaUserCircle, FaChartBar, FaVoteYea } from 'react-icons/fa';  // Importing icons from FontAwesome
import { HomeIcon, CalendarIcon } from "@heroicons/react/solid";

const SidebarUser = ({ selectedTab, setSelectedTab }) => {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <ul className="space-y-4">
        <li className="hover:bg-blue-900 p-2 rounded cursor-pointer transition duration-200" onClick={() => setSelectedTab("overview")}>
          <HomeIcon className="h-5 w-5 inline-block mr-2" />
          Dashboard Overview
        </li>
        {/* Vote Now */}
        <li 
          className={`hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center space-x-2 ${selectedTab === "vote" ? 'bg-blue-700' : ''}`} 
          onClick={() => setSelectedTab("vote")}
        >
          <FaVoteYea className="w-6 h-6" /> {/* Vote icon */}
          <span>Vote Now</span>
        </li>

        {/* Election Results */}
        <li 
          className={`hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center space-x-2 ${selectedTab === "results" ? 'bg-blue-700' : ''}`} 
          onClick={() => setSelectedTab("results")}
        >
          <FaChartBar className="w-6 h-6" /> {/* Results icon */}
          <span>Election Results</span>
        </li>

        {/* My Profile */}
        <li 
          className={`hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center space-x-2 ${selectedTab === "profile" ? 'bg-blue-700' : ''}`} 
          onClick={() => setSelectedTab("profile")}
        >
          <FaUserCircle className="w-6 h-6" /> {/* Profile icon */}
          <span>My Profile</span>
        </li>
      </ul>
    </aside>
  );
};

export default SidebarUser;

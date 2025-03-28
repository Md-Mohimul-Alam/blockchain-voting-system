import { useState } from "react";
import { HomeIcon, UserIcon, UserCircleIcon, UserGroupIcon, CalendarIcon } from "@heroicons/react/24/solid";

const SidebarAdmin = ({ setSelectedTab, isSidebarOpen }) => {
  const [isCandidatesDropdownOpen, setIsCandidatesDropdownOpen] = useState(false);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const [isElectionsDropdownOpen, setIsElectionsDropdownOpen] = useState(false);

  // Function to toggle dropdown states
  const toggleDropdown = (dropdownType) => {
    switch (dropdownType) {
      case "candidates":
        setIsCandidatesDropdownOpen(!isCandidatesDropdownOpen);
        break;
      case "users":
        setIsUsersDropdownOpen(!isUsersDropdownOpen);
        break;
      case "elections":
        setIsElectionsDropdownOpen(!isElectionsDropdownOpen);
        break;
      default:
        break;
    }
  };

  return (
    <aside className={`lg:w-64 bg-gray-900 text-white min-h-screen p-6 ${isSidebarOpen ? "block" : "hidden lg:block"}`}>
      <ul className="space-y-4">
        {/* Dashboard Overview */}
        <li className="hover:bg-blue-900 p-2 rounded cursor-pointer transition duration-200" onClick={() => setSelectedTab("overview")}>
          <HomeIcon className="h-5 w-5 inline-block mr-2" />
          Dashboard Overview
        </li>

        {/* Manage Users Dropdown */}
        <li className="p-2 rounded cursor-pointer">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleDropdown("users")}
          >
            <UserGroupIcon className="h-5 w-5 inline-block mr-2" />
            <span className="hover:bg-blue-900 p-2 rounded transition duration-200">
              Manage Users
            </span>
            <span
              className={`transform transition-transform duration-300 ${
                isUsersDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {isUsersDropdownOpen && (
            <ul className="ml-4 space-y-2">
              <li className="hover:bg-gray-600 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("allUsers")}>
                <UserIcon className="h-5 w-5 inline-block mr-2" />
                All Users
              </li>
            </ul>
          )}
        </li>

        {/* Manage Candidates Dropdown */}
        <li className="p-2 rounded cursor-pointer">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleDropdown("candidates")}
          >
            <UserCircleIcon className="h-5 w-5 inline-block mr-2" />
            <span className="hover:bg-blue-900 p-2 rounded transition duration-200">
              Manage Candidates
            </span>
            <span
              className={`transform transition-transform duration-300 ${
                isCandidatesDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {isCandidatesDropdownOpen && (
            <ul className="ml-4 space-y-2">
              <li className="hover:bg-gray-600 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("addCandidate")}>
                <UserCircleIcon className="h-5 w-5 inline-block mr-2" />
                Add Candidate
              </li>
              <li className="hover:bg-gray-600 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("updateCandidate")}>
                <UserCircleIcon className="h-5 w-5 inline-block mr-2" />
                Update Candidate
              </li>
              <li className="hover:bg-gray-600 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("AllCandidates")}>
                <UserGroupIcon className="h-5 w-5 inline-block mr-2" />
                All Candidates
              </li>
            </ul>
          )}
        </li>

        {/* Manage Elections Dropdown */}
        <li className="p-2 rounded cursor-pointer">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleDropdown("elections")}
          >
            <CalendarIcon className="h-5 w-5 inline-block mr-2" />
            <span className="hover:bg-blue-900 p-2 rounded transition duration-200">
              Manage Elections
            </span>
            <span
              className={`transform transition-transform duration-300 ${
                isElectionsDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {isElectionsDropdownOpen && (
            <ul className="ml-4 space-y-2">
              <li className="hover:bg-gray-600 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("openElection")}>
                Open Election
              </li>
              <li className="hover:bg-gray-600 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("closeElection")}>
                Close Election
              </li>
              <li className="hover:bg-gray-600 p-2 rounded cursor-pointer" onClick={() => setSelectedTab("resetElection")}>
                Reset Election
              </li>
            </ul>
          )}
        </li>
      </ul>
    </aside>
  );
};

export default SidebarAdmin;

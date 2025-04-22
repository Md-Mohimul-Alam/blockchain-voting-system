import React from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();

  const handleCreateElection = () => {
    navigate("/create-election");
  };

  const handleViewUsers = () => {
    navigate("/admin/users");
  };

  const handleSystemReset = () => {
    // Ideally, protected by role and confirmation modal
    if (window.confirm("Are you sure you want to reset the system?")) {
      console.log("System reset triggered.");
      // call backend API here
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid gap-6">
        <button
          onClick={handleCreateElection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create New Election
        </button>

        <button
          onClick={handleViewUsers}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Manage Registered Users
        </button>

        <button
          onClick={handleSystemReset}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reset Voting System
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;

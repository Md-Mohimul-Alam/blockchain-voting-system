import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api"; // Ensure to import your API service

const ELManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState(null); // State to handle modal user data
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await API.get("/users/all"); // Fetching all users
        setUsers(response.data); // Set users data in state
        setLoading(false); // Turn off the loading indicator
      } catch (error) {
        setLoading(false); // Turn off the loading indicator in case of error
        toast.error("Failed to fetch users"); // Show error toast
        console.error("Error fetching users:", error); // Log error for debugging
      }
    };

    fetchAllUsers();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Open Modal with user details
  const handleViewDetails = (user) => {
    setModalUser(user); // Set the user data to display in the modal
    setShowModal(true); // Open the modal
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalUser(null);
  };

  const renderUserTable = (data) => (
    <div className="mb-8">
      {data.length === 0 ? (
        <p className="text-gray-500 italic">No users found.</p>
      ) : (
        <div className="overflow-x-auto shadow-md sm:rounded-lg w-300">
          <table className="min-w-full bg-white border border-gray-200 border-separate items-center ">
            <thead className="divide-y divide-gray-500">
              <tr className="divide-y divide-gray-500 items-center">
                <th className="px-6 py-3 text-center items-center text-sm font-semibold text-gray-700 border-b">Role</th>
                <th className="px-6 py-3 text-center text-sm items-center font-semibold text-gray-700 border-b">DID</th>
                <th className="px-6 py-3 text-center text-sm items-center font-semibold text-gray-700 border-b">Username</th>
                <th className="px-6 py-3 text-center text-sm items-center font-semibold text-gray-700 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user, index) => (
                <tr key={index} className="border-b ">
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{user.did}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">
                    <button
                      onClick={() => handleViewDetails(user)} // Open modal with user details
                      className="text-teal-600 hover:text-teal-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUserDetailsModal = () => (
    <div
      className={`fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center ${
        showModal ? "block" : "hidden"
      }`}
    >
      {modalUser && (
      <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 md:w-1/3 border-separate border border-gray-400">
          <div className="p-3">
            <h2 className="text-xl font-semibold text-teal-700 mb-4 text-center">{modalUser.username} 's Details</h2>
            <div className="p-3 flex justify-center">
                <img
                  src={`data:image/jpeg;base64,${modalUser.image}`}
                  alt="user"
                  className="w-20 h-20 rounded-full"
                />
            </div>
          </div>
        <table className="min-w-full bg-white border border-gray-200 items-center">
          <thead>
            <tr className="divide-y divide-x divide-gray-300">
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 border-b">Field</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 border-b">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-x divide-gray-200 items-center">
              <>
                <tr className="divide-y divide-x divide-gray-200">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Role</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{modalUser.role}</td>
                </tr>
                <tr className="divide-y divide-x divide-gray-200">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">DID</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{modalUser.did}</td>
                </tr>
                <tr className="divide-y divide-x divide-gray-200">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Full Name</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{modalUser.fullName}</td>
                </tr>
                <tr className="divide-y divide-x divide-gray-200">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">DOB</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{modalUser.dob}</td>
                </tr>
                <tr className="divide-y divide-x divide-gray-200">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Birthplace</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{modalUser.birthplace}</td>
                </tr>
                <tr className="divide-y divide-x divide-gray-200">
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Username</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{modalUser.username}</td>
                </tr>
              </>
          </tbody>
        </table>
        <div className="mt-4 text-center">
          <button
            onClick={handleCloseModal} // Close modal
            className="text-teal-600 hover:text-teal-800"
          >
            Close
          </button>
        </div>
      </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
        <div className="mb-8 bg-teal-700 flex items-center justify-center">
          <div className="block p-10 content-center ml-25">
            <h1 className="text-4xl font-bold text-teal-100 pl-5">Manage Users</h1>
            <p className="text-gray-100">View and manage all registered users.</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Loading Spinner or No Data */}
          {loading ? (
            <p className="text-gray-600 text-lg">Loading users...</p>
          ) : (
            renderUserTable(users) // Display all users here
          )}

          {/* Modal */}
          {renderUserDetailsModal()}
        </div>

      <Footer />
    </div>
  );
};

export default ELManageUsersPage;

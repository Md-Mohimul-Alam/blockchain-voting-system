import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import API from "@/services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa"; // Importing icons

// Modal component for displaying election details
const ElectionDetailsModal = ({ election, onClose, onEdit, onDelete }) => (
  <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-opacity-50">
    <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
      <h3 className="text-xl font-semibold mb-4">Election Details</h3>
      <p><strong>Election ID:</strong> {election.electionId}</p>
      <p><strong>Title:</strong> {election.title}</p>
      <p><strong>Description:</strong> {election.description}</p>
      <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
      <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
      <p><strong>Status:</strong> {election.active ? "Active" : "Inactive"}</p>
      <p><strong>Candidates:</strong> {election.candidates.length}</p>
      <p><strong>Voters:</strong> {election.voters.length}</p>
      <p><strong>Votes:</strong> {election.votes.length}</p>

      {/* Edit and Delete buttons for Upcoming Elections */}
      <div className="mt-4 flex justify-between">
        <Button onClick={() => onEdit(election)} className="bg-blue-600 text-white hover:bg-blue-700">
          Edit Election
        </Button>
        <Button onClick={() => onDelete(election.electionId)} className="bg-red-600 text-white hover:bg-red-700">
          Delete Election
        </Button>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={onClose} className="bg-gray-600 text-white hover:bg-gray-700">
          Close
        </Button>
      </div>
    </div>
  </div>
);

// Modal component for editing election details
const ElectionEditModal = ({ election, onClose, onSave }) => {
  const [editableElection, setEditableElection] = useState({ ...election });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableElection((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle Save action
  const handleSave = () => {
    onSave(editableElection);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-opacity-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
        <h3 className="text-xl font-semibold mb-4">Edit Election</h3>
        <p><strong>Election ID:</strong> {election.electionId}</p>

        {/* Editable fields */}
        <div className="mb-4">
          <label className="block">Title:</label>
          <input
            type="text"
            name="title"
            value={editableElection.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block">Description:</label>
          <textarea
            name="description"
            value={editableElection.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block">Start Date:</label>
          <input
            type="datetime-local"
            name="startDate"
            value={editableElection.startDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block">End Date:</label>
          <input
            type="datetime-local"
            name="endDate"
            value={editableElection.endDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block">Active:</label>
          <input
            type="checkbox"
            name="active"
            checked={editableElection.active}
            onChange={(e) => setEditableElection((prevState) => ({ ...prevState, active: e.target.checked }))}
            className="w-5 h-5"
          />
        </div>

        {/* Save button */}
        <div className="mt-4 flex justify-between">
          <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
            Save Changes
          </Button>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} className="bg-gray-600 text-white hover:bg-gray-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const ElectionManagement = () => {
  const { toast } = useToast();

  // States for election management
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch elections on mount
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await API.get("/elections");
        setElections(response.data);
      } catch (error) {
        console.error("Error fetching elections:", error);
        toast({ title: "Failed to fetch elections", variant: "destructive" });
      }
    };

    fetchElections();
  }, []);

  // View election details in the modal
  const showElectionDetails = (election) => {
    setSelectedElection(election);
    setShowModal(true);
    setIsEditing(false);  // Set editing state to false when viewing details
  };

  // Edit election
  const editElection = (election) => {
    setSelectedElection(election);
    setIsEditing(true);  // Set editing state to true when editing
  };

  // Save election after editing
  const saveElection = async (election) => {
    try {
      const response = await API.put(`/election/update/${election.electionId}`, election);
      toast({ title: "Election updated", variant: "success" });

      // Refetch the elections to reflect the updated election
      const result = await API.get("/elections");
      setElections(result.data);
      setShowModal(false);
    } catch (err) {
      console.error("Error updating election:", err);
      toast({ title: "Failed to update election", variant: "destructive" });
    }
  };

  // Delete election
  const deleteElection = async (electionId) => {
    try {
      await API.delete(`/election/${electionId}`);
      toast({ title: "Election deleted", variant: "success" });

      // Refetch the elections to reflect the updated list
      const response = await API.get("/elections");
      setElections(response.data); // Update the elections state
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting election:", err);
      toast({ title: "Failed to delete election", variant: "destructive" });
    }
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedElection(null);
  };

  return (
    <div>
      <Header />
      <div className="p-8 text-3xl font-bold text-center text-white bg-teal-800 shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="pl-23">Election Management</CardTitle>
        </CardHeader>
      </div>

      {/* Cards for each election */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {elections.map((election) => (
          <Card key={election.electionId} className="mt-8 border-t-4 border-teal-500">
            <CardHeader>
              <CardTitle>{election.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{election.description}</p>
              <p>Start Date: {new Date(election.startDate).toLocaleString()}</p>
              <p>End Date: {new Date(election.endDate).toLocaleString()}</p>

              {/* Active Icon */}
              <div className="flex items-center space-x-2">
                {election.active ? (
                  <FaCheckCircle className="text-green-500" /> // Active icon
                ) : (
                  <FaRegCircle className="text-gray-500" /> // Inactive icon
                )}
                <span className="text-sm">{election.active ? "Active" : "Inactive"}</span>
              </div>

              {/* Action button for all elections */}
              <div className="flex justify-between">
                <Button
                  onClick={() => showElectionDetails(election)}
                  className="w-48 bg-teal-600 text-white hover:bg-teal-700"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Election Details Modal */}
      {showModal && selectedElection && (
        isEditing ? (
          <ElectionEditModal
            election={selectedElection}
            onClose={closeModal}
            onSave={saveElection}
          />
        ) : (
          <ElectionDetailsModal
            election={selectedElection}
            onClose={closeModal}
            onEdit={editElection}
            onDelete={deleteElection}
          />
        )
      )}

      <Footer />
    </div>
  );
};

export default ElectionManagement;

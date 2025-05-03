import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import API from "@/services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

// ✅ Utility: Correct active check using UTC
const isElectionActive = (election) => {
  const now = Date.now();
  const start = Date.parse(election.startDate);
  const end = Date.parse(election.endDate);
  return start <= now && now <= end;
};

// ✅ Utility: Format date for datetime-local input field
const formatDateForInput = (dateStr) => {
  const date = new Date(dateStr);
  const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  return localISOTime;
};

// ✅ Modal: Election Details
const ElectionDetailsModal = ({ election, onClose, onEdit, onDelete }) => {
  const [winner, setWinner] = useState(null);

  // ✅ Utility: Check if election has ended
  const isElectionEnded = (election) => {
    const now = Date.now();
    const end = Date.parse(election.endDate);
    return now > end;
  };

  // ✅ Fetch winner info if election ended
  useEffect(() => {
    const fetchWinner = async () => {
      if (isElectionEnded(election)) {
        try {
          const response = await API.get(`/vote/result/${election.electionId}`);
          if (response.data && response.data.winner) {
            setWinner(response.data.winner);
          }
        } catch (error) {
          console.error("Error fetching winner:", error);
        }
      }
    };
    fetchWinner();
  }, [election]);

  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-opacity-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
        <h3 className="text-xl font-semibold mb-4">Election Details</h3>

        <p><strong>Election ID:</strong> {election.electionId}</p>
        <p><strong>Title:</strong> {election.title}</p>
        <p><strong>Description:</strong> {election.description}</p>
        <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
        <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
        <p><strong>Status:</strong> {isElectionEnded(election) ? "Ended" : "Active"}</p>
        <p><strong>Candidates:</strong> {election.candidates?.length || 0}</p>
        <p><strong>Voters:</strong> {election.voters?.length || 0}</p>
        <p><strong>Votes:</strong> {election.votes?.length || 0}</p>

        {/* ✅ Winner Info */}
        {winner && (
          <div className="mt-6 bg-green-100 p-4 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-green-700 mb-2">🏆 Winner</h4>
            {winner.image && (
              <img
                src={`data:image/png;base64,${winner.image}`}
                alt="Winner"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
              />
            )}
            <p className="text-center text-green-800 font-bold">{winner.fullName}</p>
            <p className="text-center text-green-600 text-sm">DID: {winner.did}</p>
          </div>
        )}

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
};


// ✅ Modal: Edit Election
const ElectionEditModal = ({ election, onClose, onSave }) => {
  const [editableElection, setEditableElection] = useState({ ...election });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableElection((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const now = Date.now();
    const start = Date.parse(editableElection.startDate);
    const end = Date.parse(editableElection.endDate);
    const updatedActive = start <= now && now <= end;

    const updatedElection = {
      ...editableElection,
      active: updatedActive,
    };

    onSave(updatedElection);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-opacity-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
        <h3 className="text-xl font-semibold mb-4">Edit Election</h3>
        <p><strong>Election ID:</strong> {election.electionId}</p>

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
            value={formatDateForInput(editableElection.startDate)}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block">End Date:</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formatDateForInput(editableElection.endDate)}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mt-4 flex justify-between">
          <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
            Save Changes
          </Button>
          <Button onClick={onClose} className="bg-gray-600 text-white hover:bg-gray-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Page: Election Management
const ElectionManagement = () => {
  const { toast } = useToast();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const showElectionDetails = (election) => {
    setSelectedElection(election);
    setShowModal(true);
    setIsEditing(false);
  };

  const editElection = (election) => {
    setSelectedElection(election);
    setIsEditing(true);
  };

  const saveElection = async (election) => {
    try {
      await API.put(`/election/${election.electionId}`, election);
      toast({ title: "Election updated", variant: "success" });

      const result = await API.get("/elections");
      setElections(result.data);
      setShowModal(false);
    } catch (err) {
      console.error("Error updating election:", err);
      toast({ title: "Failed to update election", variant: "destructive" });
    }
  };

  const deleteElection = async (electionId) => {
    try {
      await API.delete(`/election/${electionId}`);
      toast({ title: "Election deleted", variant: "success" });

      const response = await API.get("/elections");
      setElections(response.data);
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting election:", err);
      toast({ title: "Failed to delete election", variant: "destructive" });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedElection(null);
  };

  return (
    <div>
      <Header />
      <div className="p-8 text-3xl font-bold text-center text-white bg-teal-800 shadow-xl mb-8">
        <CardHeader>
          <CardTitle>Election Management</CardTitle>
        </CardHeader>
      </div>

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

              {/* ✅ Active Status */}
              <div className="flex items-center space-x-2">
                {isElectionActive(election) ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaRegCircle className="text-gray-500" />
                )}
                <span className="text-sm">{isElectionActive(election) ? "Active" : "Inactive"}</span>
              </div>

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

      {/* ✅ Modal */}
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

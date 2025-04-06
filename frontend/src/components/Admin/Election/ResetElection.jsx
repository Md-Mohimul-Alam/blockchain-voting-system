import { useState } from "react";
import API from "../../../api/axiosConfig"; // Adjust based on your API setup

const ResetElection = () => {
  const [electionID, setElectionID] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleResetElection = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/election/${electionID}/reset`);
      setSuccess(`Election ${electionID} has been reset successfully!`);
      setError(null);
    } catch (error) {
      console.error("Error creating election:", error); // Log the error for debugging
      setError("Error resetting election");
      setSuccess(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
      <div className="text-2xl font-semibold text-sky-700 pl-38 mb-6">Reset Election</div>
      <form onSubmit={handleResetElection} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="electionID" className="font-medium text-gray-600">
            Election ID
          </label>
          <input
            type="text"
            id="electionID"
            value={electionID}
            onChange={(e) => setElectionID(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Reset Election
        </button>
      </form>

      {success && <div className="mt-4 text-green-500">{success}</div>}
      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default ResetElection;

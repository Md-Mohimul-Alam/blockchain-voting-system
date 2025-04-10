import { useState } from "react";
import API from "../../../api/axiosConfig";  // Adjust based on your API setup

const DeclareWinner = () => {
  const [electionID, setElectionID] = useState("");  // Store election ID
  const [winnerDetails, setWinnerDetails] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDeclareWinner = async (e) => {
    e.preventDefault();
    
    try {
      // Ensure that you're calling the correct route
      const response = await API.put(`/election/${electionID}/declare-winner`);

      // Update winner details with the response data
      setWinnerDetails(response.data.winnerDetails);  // Assuming the response contains the winner info
      setSuccess(`Winner declared successfully!`);
      setError(null);
    } catch (error) {
      console.error("Error declaring winner:", error);
      setError("Error declaring winner. Please try again.");
      setSuccess(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto ">
      <div className="text-2xl font-semibold text-sky-700 pl-22 mb-6">Declare Election Winner</div>
      <form onSubmit={handleDeclareWinner} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="electionID" className="font-medium text-gray-600">
            Election ID
          </label>
          <input
            type="text"
            id="electionID"
            value={electionID}
            onChange={(e) => setElectionID(e.target.value)}  // Bind election ID
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Declare Winner
        </button>
      </form>

      {success && <div className="mt-4 text-green-500">{success}</div>}
      {error && <div className="mt-4 text-red-500">{error}</div>}

      {winnerDetails && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <h3 className="text-xl font-semibold">Winner Details:</h3>
          <p><strong>Candidate Name:</strong> {winnerDetails.candidateName}</p>
          <p><strong>Candidate DID:</strong> {winnerDetails.candidateDID}</p>
          <p><strong>Total Votes:</strong> {winnerDetails.totalVotes}</p>
          <p><strong>Date of Birth:</strong> {winnerDetails.dob}</p>
        </div>
      )}
    </div>
  );
};

export default DeclareWinner;
import { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Import centralized API instance
import { CheckCircleIcon, UserIcon, ClockIcon, LocationMarkerIcon, TrendingUpIcon } from '@heroicons/react/outline'; // Import icons from Heroicons

const Results = () => {
  const [results, setResults] = useState(null);  // Initialize results as null for loading state
  const [error, setError] = useState(null);
  const [electionID] = useState("Election 1"); // Example election ID

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await API.get(`/election/${electionID}/result`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Pass the token for authentication
          },
        });

        setResults(response.data); // Set results data with winner details and candidates
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error("Error fetching results:", error);
        setError("Failed to fetch results");
      }
    };

    fetchResults();
  }, [electionID]);  // Re-run when electionID changes (could be dynamic)

  if (error) {
    return (
      <div className="bg-red-200 text-red-800 p-4 rounded-lg shadow-md">
        {error}
      </div>
    );
  }

  // If no results have been fetched yet
  if (!results) {
    return <div className="text-xl text-gray-600">Loading results...</div>;
  }

  // If results are available, display the winner and candidates
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="text-4xl font-semibold text-center text-blue-600 mb-6">Election Results</div>

      <div className="mb-6">
        <div className="text-lg font-semibold text-gray-700 mb-2">Winner:</div>
        <div className="bg-green-100 p-6 rounded-lg shadow-lg transition-all hover:bg-green-200 hover:shadow-xl">
          <div className="flex items-center mb-2">
            <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
            <div className="text-xl font-bold text-gray-800">{results.winner.name}</div>
          </div>
          <div className="text-gray-600 flex items-center mb-1">
            <TrendingUpIcon className="w-5 h-5 text-gray-500 mr-2" />
            Votes: {results.winner.votes}
          </div>
          <div className="text-gray-600 flex items-center mb-1">
            <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
            Date of Birth: {results.winner.dob}
          </div>
          <div className="text-gray-600 flex items-center mb-1">
            <LocationMarkerIcon className="w-5 h-5 text-gray-500 mr-2" />
            Birthplace: {results.winner.birthplace}
          </div>
          <img src={results.winner.logo} alt={results.winner.name} className="w-20 h-20 mt-4 rounded-full border-2 border-gray-200 shadow-md transition-all transform hover:scale-110" />
        </div>
      </div>

      <div className="text-lg font-semibold text-gray-700 mb-2">Other Candidates:</div>
      <div className="space-y-4">
        {results.candidates && results.candidates.length > 0 ? (
          results.candidates.map((candidate) => (
            <div key={candidate.did} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-lg hover:bg-blue-50">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-blue-600 mr-3" />
                <div className="text-lg font-semibold text-gray-800">{candidate.name}</div>
              </div>
              <div className="text-gray-600">{candidate.votes} votes</div>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No candidates available.</div>
        )}
      </div>
    </div>
  );
};

export default Results;
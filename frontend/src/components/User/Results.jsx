import { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Import centralized API instance

const Results = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await API.get("/election/results", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setResults(response.data); // Set results data
      } catch (error) {
        console.error("Error fetching results:", error);
        setError("Failed to fetch results");
      }
    };

    fetchResults();
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Election Results</h3>
      {error && <div className="bg-red-200 text-red-800 p-4 rounded-lg">{error}</div>}
      <div className="space-y-4">
        {results.map((candidate) => (
          <div key={candidate.did} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
            <span>{candidate.name}</span>
            <span>{candidate.votes} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;

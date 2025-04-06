import React, { useEffect, useState } from "react";
import API from "../../api/api"; // Importing API instance for fetching data

const VotersList = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all voters when the component mounts
    const fetchVoters = async () => {
      try {
        const response = await API.get("/voters"); // Assuming /voters is your API endpoint to get all voters
        setVoters(response.data.voters);
        setLoading(false);
      } catch {
        setError("Error fetching voters.");
        setLoading(false);
      }
    };

    fetchVoters();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading voters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <div className="text-3xl font-mono mb-4 text-sky-700 ml-105 pt-5">Voters List</div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">DID</th>
              <th className="px-4 py-2 text-left text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-gray-600">Voted</th>
              <th className="px-4 py-2 text-left text-gray-600">DOB</th>
              <th className="px-4 py-2 text-left text-gray-600">Birth Place</th>

            </tr>
          </thead>
          <tbody>
            {voters.map((voter) => (
              <tr key={voter.did} className="border-b">
                <td className="px-4 py-2 text-gray-700">{voter.did}</td>
                <td className="px-4 py-2 text-gray-700">{voter.name}</td>
                <td className="px-4 py-2 text-gray-700">
                  {voter.voted ? (
                    <span className="text-green-500">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700">{voter.dob}</td>
                <td className="px-4 py-2 text-gray-700">{voter.birthplace}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VotersList;

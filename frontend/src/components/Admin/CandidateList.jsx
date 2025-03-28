import API from "../../api/axiosConfig"; // Import centralized API instance

const CandidateList = ({ candidates, loading, error, setSelectedTab, setSelectedCandidate, fetchCandidates }) => {
  const handleDeleteCandidate = async (did) => {
    try {
      // Make sure you're sending the correct candidate DID (`c2`)
      await API.delete(`/candidate/${did}`);
      alert("Candidate deleted successfully!");
      fetchCandidates(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Error deleting candidate");
    }
  };
  
  
  return (
    <div>
      <div className="text-xl font-bold mb-4 text-black">Candidates List</div>
      
      {loading && <div className="text-center">Loading candidates...</div>}

      {error && <div className="text-red-500 text-center">{error}</div>}

      {/* Display candidates in a table */}
      {!loading && !error && candidates.length > 0 && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-6 py-3 text-left">DID</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Date of Birth</th>
                <th className="px-6 py-3 text-left">Birthplace</th>
                <th className="px-6 py-3 text-left">Vote</th>
                <th className="px-6 py-3 text-left">Logo</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.did} className="border-b">
                  <td className="px-6 py-4">{candidate.did}</td>
                  <td className="px-6 py-4">{candidate.name}</td>
                  <td className="px-6 py-4">{candidate.dob}</td>
                  <td className="px-6 py-4">{candidate.birthplace}</td>
                  <td className="px-6 py-4">{candidate.votes}</td>
                  <td className="px-6 py-4">
                    <img
                      src={`/uploads/${candidate.logo}`} // Assuming logo is stored in the uploads folder
                      alt={candidate.name}
                      className="w-10 h-10 object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-500 mr-4"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setSelectedTab("updateCandidate");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => handleDeleteCandidate(candidate.did)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message if no candidates are available */}
      {candidates.length === 0 && !loading && !error && (
        <div className="text-center">No candidates found.</div>
      )}
    </div>
  );
};

export default CandidateList;

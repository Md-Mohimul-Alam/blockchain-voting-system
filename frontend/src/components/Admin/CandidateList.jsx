import axios from "axios";

const CandidateList = ({ candidates, loading, error, setSelectedTab, setSelectedCandidate, fetchCandidates }) => {
    const handleDeleteCandidate = async (did) => {
      try {
        await axios.delete(`http://localhost:5001/api/candidate/delete/${did}`);
        alert("Candidate deleted successfully!");
        fetchCandidates(); // Refresh the list
      } catch (error) {
        console.error("Error deleting candidate:", error);
        alert("Error deleting candidate");
      }
    };
  
    return (
      <div>
        <div className="text-xl font-bold mb-4 txt-black">Candidates List</div>
        {loading ? (
          <div>Loading candidates...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : candidates.length > 0 ? (
          candidates.map((candidate) => (
            <div key={candidate.did} className="flex justify-between items-center mb-2">
              <span>{candidate.name}</span>
              <div>
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
              </div>
            </div>
          ))
        ) : (
          <div>No candidates found</div>
        )}
      </div>
    );
  };
  
  export default CandidateList;
  
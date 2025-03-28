import { useState, useEffect } from "react";
import API from "../../api/axiosConfig"; // Import centralized API instance

const CandidateUpdateForm = ({ selectedCandidate, setSelectedCandidate, setSelectedTab, fetchCandidates }) => {
  const [candidateFormData, setCandidateFormData] = useState({
    did: "",
    name: "",
    dob: "",
    birthplace: "",
    logo: null,
  });
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(""); // Track error state

  // Initialize form data when selectedCandidate changes
  useEffect(() => {
    if (selectedCandidate) {
      setCandidateFormData(selectedCandidate);
    }
  }, [selectedCandidate]);

  const handleInputChange = (e) => {
    setCandidateFormData({ ...candidateFormData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setCandidateFormData({ ...candidateFormData, logo: e.target.files[0] });
  };

  const handleUpdateCandidate = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(""); // Reset any previous error
  
    const formData = new FormData();
    formData.append("did", candidateFormData.did);
    formData.append("name", candidateFormData.name);
    formData.append("dob", candidateFormData.dob);
    formData.append("birthplace", candidateFormData.birthplace);
    if (candidateFormData.logo) formData.append("logo", candidateFormData.logo);
  
    try {
      await API.put("/candidate/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Candidate updated successfully!");
      fetchCandidates(); // Fetch updated candidate list
      setSelectedTab("AllCandidates"); // Go back to the candidate list tab
      setSelectedCandidate(null); // Clear selected candidate for future updates
      setLoading(false); // Stop loading
    } catch (error) {
      setLoading(false); // Stop loading
      console.error("Error updating candidate:", error);
      setError(error.response ? error.response.data.error : "Error updating candidate. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleUpdateCandidate} className="space-y-6 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
      <div className="text-2xl font-semibold text-gray-800 mb-6">Update Candidate</div>

      {/* Display Error Message */}
      {error && <div className="text-red-500 text-center">{error}</div>}

      <div className="flex flex-col space-y-2">
        <label htmlFor="did" className="text-gray-600 font-medium">DID</label>
        <input
          type="text"
          name="did"
          id="did"
          placeholder="Enter DID"
          value={candidateFormData.did}
          onChange={handleInputChange}
          required
          className="border-2 border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="name" className="text-gray-600 font-medium">Candidate Name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Enter Candidate Name"
          value={candidateFormData.name}
          onChange={handleInputChange}
          required
          className="border-2 border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="dob" className="text-gray-600 font-medium">Date of Birth</label>
        <input
          type="date"
          name="dob"
          id="dob"
          value={candidateFormData.dob}
          onChange={handleInputChange}
          required
          className="border-2 border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="birthplace" className="text-gray-600 font-medium">Birthplace</label>
        <input
          type="text"
          name="birthplace"
          id="birthplace"
          placeholder="Enter Birthplace"
          value={candidateFormData.birthplace}
          onChange={handleInputChange}
          required
          className="border-2 border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="logo" className="text-gray-600 font-medium">Upload Logo</label>
        <input
          type="file"
          name="logo"
          id="logo"
          onChange={handleFileChange}
          className="border-2 border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className={`bg-blue-500 text-white px-6 py-3 rounded-lg w-full ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'} transition-colors duration-300`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Candidate"}
        </button>
      </div>
    </form>
  );
};

export default CandidateUpdateForm;

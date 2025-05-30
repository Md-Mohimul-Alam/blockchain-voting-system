// src/components/Admin/CandidateForm.jsx
import { useState } from "react";
import API from "../../api/axiosConfig"; // Importing centralized API instance

const CandidateForm = ({ setSelectedTab, fetchCandidates }) => {
  const [candidateFormData, setCandidateFormData] = useState({
    did: "",
    name: "",
    dob: "",
    birthplace: "",
    logo: null,
  });

  const handleInputChange = (e) => {
    setCandidateFormData({ ...candidateFormData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setCandidateFormData({ ...candidateFormData, logo: e.target.files[0] });
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
  
    // Validate if all required fields are filled
    if (!candidateFormData.did || !candidateFormData.name || !candidateFormData.dob || !candidateFormData.birthplace || !candidateFormData.logo) {
      alert("Please fill in all required fields.");
      return;
    }
  
    const formData = new FormData();
    formData.append("did", candidateFormData.did);  // Ensure 'did' is passed correctly
    formData.append("name", candidateFormData.name);
    formData.append("dob", candidateFormData.dob);
    formData.append("birthplace", candidateFormData.birthplace);
    formData.append("logo", candidateFormData.logo);
    console.log("Candidate data being sent:", candidateFormData);

    try {
      await API.post("/candidate/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Candidate registered successfully!");
      fetchCandidates();
      setSelectedTab("AllCandidates");
      setCandidateFormData({ did: "", name: "", dob: "", birthplace: "", logo: null });
    } catch (error) {
      console.error("Error registering candidate:", error);
      alert("Error registering candidate");
    }
  };
  
  return (
    <form onSubmit={handleCreateCandidate} className="space-y-6 bg-white p-15 rounded-lg shadow-lg w-full max-w-lg mx-auto">
      <div className="text-2xl font-semibold text-sky-700 pl-22 mb-6">Add New Candidate</div>

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
          className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-600 transition-colors duration-300"
        >
          Create Candidate
        </button>
      </div>
    </form>
  );
};

export default CandidateForm;

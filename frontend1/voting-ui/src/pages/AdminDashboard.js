import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/api";
import CandidatesList from "../components/CandidatesList";
import UserList from "../components/UserList";
import "./Dashboard.css";

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [adminDID, setAdminDID] = useState("");
  const [users, setUsers] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    candidateID: "",
    name: "",
    dob: "",
    logo: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const candidatesRes = await axios.get(`${API_URL}/listCandidates`, { headers });
        setCandidates(candidatesRes.data);
        const usersRes = await axios.get(`${API_URL}/listUsers`, { headers });
        setUsers(usersRes.data);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };
    fetchData();
  }, [navigate]);

  const handleRegisterCandidate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!adminDID.trim() || !newCandidate.candidateID.trim() || !newCandidate.name.trim()) {
      alert("⚠️ All fields are required!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("adminDID", adminDID.trim());
      formData.append("candidateID", newCandidate.candidateID.trim());
      formData.append("name", newCandidate.name.trim());
      formData.append("dob", newCandidate.dob.trim());
      if (newCandidate.logo) {
        formData.append("logo", newCandidate.logo);
      }
      await axios.post(`${API_URL}/registerCandidate`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert(`✅ Candidate ${newCandidate.name} registered successfully!`);
      setNewCandidate({ candidateID: "", name: "", dob: "", logo: null });
      const candidatesRes = await axios.get(`${API_URL}/listCandidates`, { headers: { Authorization: `Bearer ${token}` } });
      setCandidates(candidatesRes.data);
    } catch (error) {
      console.error("❌ Register Candidate Error:", error.response?.data || error);
      alert(error.response?.data?.error || "❌ Error registering candidate.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <h2>Register New Candidate</h2>
      <form onSubmit={handleRegisterCandidate} className="form-container">
        <input type="text" placeholder="Admin DID" value={adminDID} onChange={(e) => setAdminDID(e.target.value)} required />
        <input type="text" placeholder="Candidate ID" value={newCandidate.candidateID} onChange={(e) => setNewCandidate({ ...newCandidate, candidateID: e.target.value })} required />
        <input type="text" placeholder="Candidate Name" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} required />
        <input type="date" placeholder="DOB" value={newCandidate.dob} onChange={(e) => setNewCandidate({ ...newCandidate, dob: e.target.value })} required />
        <input type="file" accept="image/*" onChange={(e) => setNewCandidate({ ...newCandidate, logo: e.target.files[0] })} />
        <button type="submit">Register Candidate</button>
      </form>
      <h2>All Candidates</h2>
      <CandidatesList candidates={candidates} setCandidates={setCandidates} />
      <h2>All Users</h2>
      <UserList users={users} />
    </div>
  );
};

export default AdminDashboard;

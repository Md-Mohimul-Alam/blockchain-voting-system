import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

const Register = () => {
  const [nid, setNid] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nid, password, role }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        alert("Registration failed! " + data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="NID Number" value={nid} onChange={(e) => setNid(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

const Login = () => {
  const [nid, setNid] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, { // ✅ Corrected endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nid, password }),
      });
  
      if (!response.ok) {
        throw new Error("Login request failed");
      }
  
      const data = await response.json();
      if (data.success) {
        login(data.user);
        navigate("/");
      } else {
        alert("Login failed! " + data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="NID Number" value={nid} onChange={(e) => setNid(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;

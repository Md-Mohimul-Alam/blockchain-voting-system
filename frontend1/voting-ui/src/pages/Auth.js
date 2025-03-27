import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/api"; // Ensure the correct API_URL is set
import "./Login.css";

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginRole, setLoginRole] = useState("user");
  const [formData, setFormData] = useState({
    did: "",
    username: "", // Initialize username as an empty string
    name: "",
    dob: "",
    birthplace: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for required fields
    if (!formData.did.trim() || !formData.username.trim() || !formData.dob.trim() || !formData.password.trim()) {
      alert("⚠️ DID, Username, DOB, and Password are required!");
      return;
    }

    try {
      let url = `${API_URL}/login`; // Default login URL
      let payload = { 
        did: formData.did.trim().toLowerCase(), 
        userName: formData.username.trim(),
        dob: formData.dob.trim(),
        password: formData.password.trim(),
      };

      // Registration logic
      if (isRegister) {
        if (isAdmin) {
          url = `${API_URL}/register-admin`; // Register Admin
          payload = {
            did: formData.did.trim().toLowerCase(),
            userName: formData.username.trim(),
            dob: formData.dob.trim(),
            password: formData.password.trim(),
          };
        } else {
          url = `${API_URL}/register`; // Register User
          payload = {
            did: formData.did.trim().toLowerCase(),
            name: formData.name.trim(),
            dob: formData.dob.trim(),
            birthplace: formData.birthplace.trim(),
            userName: formData.username.trim(), // Always include username for User registration
            password: formData.password.trim(),
          };
        }
      }

      // Send request to backend
      const response = await axios.post(url, payload);
      if (isRegister) {
        alert(`✅ ${isAdmin ? "Admin" : "User"} registered successfully!`);
      } else {
        // If login successful, store the JWT token and role
        if (response.data.token && response.data.role) {
          localStorage.setItem("token", response.data.token); // Store JWT token
          localStorage.setItem("role", response.data.role); // Store role (admin/user)
          navigate(response.data.role === "admin" ? "/admin-dashboard" : "/user-dashboard"); // Redirect based on role
        } else {
          alert("⚠️ Login failed. Please check your credentials.");
        }
      }
    } catch (error) {
      console.error("❌ Auth Error:", error.response);
      alert(error.response?.data?.error || "⚠️ An unexpected error occurred.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Secure Blockchain Voting</h1>
        <p>Experience secure, transparent, and tamper-proof blockchain-based voting.</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2>{isRegister ? (isAdmin ? "Register Admin" : "Register User") : "Login"}</h2>
          <div className="auth-tabs">
            <span className={!isRegister ? "active" : ""} onClick={() => setIsRegister(false)}>Login</span>
            <span className={isRegister ? "active" : ""} onClick={() => setIsRegister(true)}>Register</span>
          </div>

          {isRegister ? (
            <div className="role-dropdown">
              <label>Register As</label>
              <select value={isAdmin ? "admin" : "user"} onChange={(e) => setIsAdmin(e.target.value === "admin")}> 
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ) : (
            <div className="role-dropdown">
              <label>Login As</label>
              <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)}> 
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>DID</label>
            <input type="text" name="did" value={formData.did} onChange={handleChange} required />

            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />

            <label>Date of Birth (DOB)</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />

            {isRegister && !isAdmin && (
              <>
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                <label>Birthplace</label>
                <input type="text" name="birthplace" value={formData.birthplace} onChange={handleChange} required />
              </>
            )}

            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            <button type="submit">{isRegister ? "Register" : "Login"}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

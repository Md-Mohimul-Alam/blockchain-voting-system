import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/api";
import "./Login.css";

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    did: "",
    username: "",
    userId: "",
    district: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.did.trim() || !formData.password.trim()) {
      alert("⚠️ DID and Password are required!");
      return;
    }

    try {
      let url = `${API_URL}/login`;
      let payload = {
        did: formData.did.trim().toLowerCase(),
        password: formData.password.trim(),
      };

      if (isRegister) {
        if (isAdmin) {
          // ✅ Admin Registration
          url = `${API_URL}/registerAdmin`;
          payload = {
            did: formData.did.trim().toLowerCase(),
            username: formData.username.trim(),
            password: formData.password.trim(),
          };
        } else {
          // ✅ User Registration
          url = `${API_URL}/registerUser`;
          payload = {
            did: formData.did.trim().toLowerCase(),
            userId: formData.userId.trim(),
            district: formData.district.trim(),
            password: formData.password.trim(),
          };
        }
      }

      const response = await axios.post(url, payload);

      if (isRegister) {
        alert(`✅ ${isAdmin ? "Admin" : "User"} registered successfully!`);
      } else {
        if (response.data.token && response.data.role) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.role);

          console.log("✅ Login Successful! Redirecting...");
          navigate(response.data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
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

          {isRegister && (
            <div className="role-dropdown">
              <label>Register As</label>
              <select value={isAdmin ? "admin" : "user"} onChange={(e) => setIsAdmin(e.target.value === "admin")}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}


          <form onSubmit={handleSubmit}>
            <label>DID</label>
            <input type="text" name="did" value={formData.did} onChange={handleChange} required />

            {isRegister && isAdmin && (
              <>
                <label>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
              </>
            )}

            {isRegister && !isAdmin && (
              <>
                <label>User ID</label>
                <input type="text" name="userId" value={formData.userId} onChange={handleChange} required />

                <label>District</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} required />
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

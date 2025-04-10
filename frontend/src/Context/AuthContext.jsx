import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create the context
const AuthContext = createContext();

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider to wrap around the app
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const storedRole = localStorage.getItem("userRole");

    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  const login = (token, role, did) => {
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("did", did);
    setIsAuthenticated(true);
    setUserRole(role);

    // Redirect to the appropriate dashboard
    navigate(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("did");
    setIsAuthenticated(false);
    setUserRole(null);

    // Redirect to login page
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
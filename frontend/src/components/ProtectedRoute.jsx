import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; // Import the Auth context

const ProtectedRoute = ({ children, redirectTo }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />; // Redirect to login if not authenticated
  }

  return children; // If authenticated, render the protected component
};

export default ProtectedRoute;
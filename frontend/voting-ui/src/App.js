import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";  // ✅ Import Navbar
import "./App.css";

const App = () => {
  return (
    <Router>
      {/* ✅ Move Navbar outside Routes so it renders globally */}
      <Navbar />

      <Routes>
        <Route path="/login" element={<Auth />} />

        {/* 🔹 Protected Routes for Admin */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 🔹 Protected Routes for Users */}
        <Route 
          path="/user-dashboard" 
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 🔹 Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

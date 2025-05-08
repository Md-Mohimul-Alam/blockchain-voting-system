import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";

const UserComplaintForm = () => {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Complaint content cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // assuming you store user info in localStorage

      const { data } = await API.post(
        "/complaint",
        {
          did: user.did,
          content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Complaint submitted successfully.");
      setError("");
      setContent("");
    } catch (err) {
      console.error("Complaint submission failed:", err);
      setError("Failed to submit complaint.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow px-6 py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-700 mb-6 text-center">
          Submit a Complaint
        </h1>

        {message && <div className="text-green-600 mb-4 text-center">{message}</div>}
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

        <div className="bg-white p-6 rounded shadow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your complaint..."
            rows={6}
            className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-teal-600"
          />

          <button
            onClick={handleSubmit}
            className="mt-4 btn bg-teal-600 text-white hover:bg-teal-700"
          >
            Submit Complaint
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserComplaintForm;

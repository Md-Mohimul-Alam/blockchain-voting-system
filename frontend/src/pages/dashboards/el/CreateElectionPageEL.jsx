import React, { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import API from "@/services/api"; // Ensure you import your API service

const CreateElectionEl = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    electionId: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Creating Election:", formData);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Token not found. Please login again.");
        return;
      }

      // Use axios to send a POST request
      const response = await API.post("/election", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success("Election created successfully!");

        const user = JSON.parse(localStorage.getItem("user"));
        const role = user?.role?.toLowerCase() || "Electioncommunity";

        navigate(`/dashboard/${role}`);
      } else {
        throw new Error(`Failed to create election. Status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Failed to create election.");
      console.error("Election creation error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full px-6 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6 text-teal-700">
            Create New Election
          </h1>
          <h2 className="text-2xl font-semibold text-center mb-10 text-teal-800">
            Set new election details
          </h2>

          <Card className="max-w-xl mx-auto p-8">
            <form onSubmit={handleSubmit} className="grid gap-4">
              {/* Election ID Input */}
              <Input
                type="text"
                name="electionId"
                placeholder="Election ID"
                value={formData.electionId}
                onChange={handleChange}
                required
              />

              {/* Election Title Input */}
              <Input
                type="text"
                name="title"
                placeholder="Election Title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              {/* Election Description Input */}
              <textarea
                name="description"
                placeholder="Election Description"
                value={formData.description}
                onChange={handleChange}
                required
                className="border px-4 py-2 rounded"
              />

              {/* Election Start Date Input */}
              <Input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              {/* Election End Date Input */}
              <Input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />

              {/* Submit Button */}
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                Create Election
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default CreateElectionEl;

import React, { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

const CreateElection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      // 🔐 You would integrate this with your backend or Fabric network
      console.log("Creating Election:", formData);

      // Example success feedback
      toast.success("Election created successfully!");
      navigate("/admin");
    } catch (error) {
      toast.error("Failed to create election.");
      console.error("Election creation error:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Election</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="text"
          name="title"
          placeholder="Election Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Election Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="datetime-local"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="datetime-local"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Create Election
        </button>
      </form>
    </div>
  );
};

export default CreateElection;

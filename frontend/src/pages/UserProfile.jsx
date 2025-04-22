import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    dob: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData(res.data);
      } catch (error) {
        toast.error("Failed to load profile");
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:4000/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setEditable(false);
    } catch (error) {
      toast.error("Update failed");
      console.error("Update error:", error);
    }
  };

  if (!user) return <p className="p-6 text-center">Loading profile...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      <form onSubmit={handleUpdate} className="grid gap-4">
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          disabled={!editable}
          className="border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={!editable}
          className="border px-4 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!editable}
          className="border px-4 py-2 rounded"
        />
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          disabled={!editable}
          className="border px-4 py-2 rounded"
        />

        {editable ? (
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Save Changes
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditable(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Edit Profile
          </button>
        )}
      </form>
    </div>
  );
};

export default UserProfile;

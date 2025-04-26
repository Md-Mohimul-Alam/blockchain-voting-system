import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    birthplace: "",
    image: "",
    dob: "",
    username: "",
    password: "",
    role: "",
    did: "",
    createdAt: ""
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        if (!token || !user) return navigate("/login");
        const { role, did } = user;

        const res = await axios.get(`http://localhost:5001/api/voting/profile/${role}/${did}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = res.data;
        setUser(profile);
        setFormData({
          fullName: profile.fullName,
          birthplace: profile.birthplace,
          image: profile.image,
          dob: profile.dob,
          username: profile.username,
          password: "********",
          role: profile.role,
          did: profile.did,
          createdAt: profile.createdAt
        });
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. Please login with proper credentials.");
          navigate("/login");
        } else {
          toast.error("Failed to load profile");
          console.error("Profile fetch error:", error);
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const { role, did } = user;

      const form = new FormData();
      form.append("role", role);
      form.append("did", did);
      form.append("fullName", formData.fullName);
      form.append("dob", formData.dob);
      form.append("birthplace", formData.birthplace);
      if (file) form.append("image", file);

      await axios.put(`http://localhost:5001/api/voting/profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full px-6 py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto border-t-2 border-teal-600 rounded-lg shadow-lg p-6 bg-white">
          <div className="flex flex-col md:flex-row border-2 border-teal-600 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-teal-700 mb-4">{formData.fullName}</h2>
              <p className="text-gray-600 text-lg mb-2">DID: {formData.did}</p>
              <p className="text-gray-600 text-lg mb-2">Role: {formData.role}</p>
              <p className="text-gray-600 text-lg mb-2">Username: {formData.username}</p>
              <p className="text-gray-600 text-lg mb-2">Date of Birth: {formData.dob}</p>
              <p className="text-gray-600 text-lg mb-2">Birthplace: {formData.birthplace}</p>
              <p className="text-gray-600 text-lg mb-2">Created At: {new Date(formData.createdAt).toLocaleString()}</p>
              <div className="mt-6">
                <Button
                  type="button"
                  onClick={() => setEditable((prev) => !prev)}
                  className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" /> Edit Profile
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 bg-black flex items-center justify-center">
              {formData.image && (
                <img
                  src={`data:image/jpeg;base64,${formData.image}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          {editable && (
            <Card className="p-6 mt-6">
              <form onSubmit={handleUpdate} className="grid gap-4">
                <Input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" />
                <Input type="date" name="dob" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" />
                <Input type="text" name="birthplace" value={formData.birthplace} onChange={handleChange} placeholder="Birthplace" />
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;

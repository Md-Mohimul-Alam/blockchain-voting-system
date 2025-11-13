import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { 
  Pencil, 
  Save, 
  X, 
  Camera, 
  User, 
  Shield, 
  Calendar, 
  MapPin, 
  Key, 
  Mail,
  Clock,
  CheckCircle2
} from "lucide-react";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        
        if (!token || !user) {
          toast.error("Please login to view your profile");
          navigate("/login");
          return;
        }

        const { role, did } = user;

        const res = await axios.get(`http://localhost:5001/api/voting/profile/${role}/${did}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = res.data.data || res.data;
        setUser(profile);
        setFormData({
          fullName: profile.fullName || "",
          birthplace: profile.birthplace || "",
          image: profile.image || "",
          dob: profile.dob || "",
          username: profile.username || "",
          password: "********",
          role: profile.role || "",
          did: profile.did || "",
          createdAt: profile.createdAt || ""
        });

        if (profile.image) {
          setImagePreview(`data:image/jpeg;base64,${profile.image}`);
        }

      } catch (error) {
        console.error("Profile fetch error:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. Please login with proper credentials.");
          navigate("/login");
        } else {
          toast.error("Failed to load profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const { role, did } = user;

      const form = new FormData();
      form.append("role", role);
      form.append("did", did);
      form.append("fullName", formData.fullName);
      form.append("birthplace", formData.birthplace);
      if (file) form.append("image", file);

      const res = await axios.put(`http://localhost:5001/api/voting/profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local storage user data
      const updatedUser = { ...user, fullName: formData.fullName };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");
      setEditable(false);
      setFile(null);
      
      // Refresh profile data
      const profileRes = await axios.get(`http://localhost:5001/api/voting/profile/${role}/${did}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const updatedProfile = profileRes.data.data || profileRes.data;
      setUser(updatedProfile);
      if (updatedProfile.image) {
        setImagePreview(`data:image/jpeg;base64,${updatedProfile.image}`);
      }

    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditable(false);
    setFile(null);
    setImagePreview(user.image ? `data:image/jpeg;base64,${user.image}` : "");
    setFormData({
      fullName: user.fullName || "",
      birthplace: user.birthplace || "",
      image: user.image || "",
      dob: user.dob || "",
      username: user.username || "",
      password: "********",
      role: user.role || "",
      did: user.did || "",
      createdAt: user.createdAt || ""
    });
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'voter': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'candidate': return 'bg-green-100 text-green-800 border-green-200';
      case 'electioncommission': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-gray-50 to-teal-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-gray-50 to-teal-50">
          <Card className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
            <Button onClick={() => navigate("/login")} className="bg-teal-600 hover:bg-teal-700">
              Return to Login
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <Header />
      
      <main className="flex-grow w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">User Profile</h1>
            <p className="text-gray-600 text-lg">Manage your personal information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 h-24"></div>
                <CardContent className="p-6 -mt-12">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg mx-auto">
                        <AvatarImage 
                          src={imagePreview} 
                          alt={formData.fullName}
                        />
                        <AvatarFallback className="text-2xl bg-teal-100 text-teal-600">
                          {getInitials(formData.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      {editable && (
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-teal-600 rounded-full p-2 cursor-pointer shadow-lg hover:bg-teal-700 transition-colors">
                          <Camera className="w-4 h-4 text-white" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                      {formData.fullName || "Unknown User"}
                    </h2>
                    
                    <Badge className={`${getRoleColor(formData.role)} text-sm font-medium px-3 py-1 border`}>
                      {formData.role || "Unknown Role"}
                    </Badge>
                    
                    <p className="text-gray-600 mt-3 text-sm flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" />
                      {formData.username || "No username"}
                    </p>
                    
                    <div className="mt-6 space-y-3">
                      <Button
                        onClick={() => setEditable(!editable)}
                        className={`w-full flex items-center justify-center gap-2 ${
                          editable 
                            ? "bg-gray-600 hover:bg-gray-700" 
                            : "bg-teal-600 hover:bg-teal-700"
                        } text-white transition-colors`}
                      >
                        {editable ? (
                          <>
                            <X className="w-4 h-4" />
                            Cancel Edit
                          </>
                        ) : (
                          <>
                            <Pencil className="w-4 h-4" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card className="shadow-lg border-0 mt-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profile Complete</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Complete
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-900">
                      {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-teal-50">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <User className="w-6 h-6 text-teal-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!editable ? (
                    // View Mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </Label>
                        <p className="text-gray-900 font-medium">{formData.fullName || "Not provided"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Digital ID
                        </Label>
                        <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                          {formData.did || "Not available"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </Label>
                        <p className="text-gray-900">
                          {formData.dob ? new Date(formData.dob).toLocaleDateString() : "Not provided"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Birthplace
                        </Label>
                        <p className="text-gray-900">{formData.birthplace || "Not provided"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Username
                        </Label>
                        <p className="text-gray-900">{formData.username || "Not provided"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Password
                        </Label>
                        <p className="text-gray-900 font-mono">••••••••</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Created At
                        </Label>
                        <p className="text-gray-900">
                          {formData.createdAt ? new Date(formData.createdAt).toLocaleString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Full Name *
                          </Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            className="focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthplace" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Birthplace
                          </Label>
                          <Input
                            id="birthplace"
                            name="birthplace"
                            value={formData.birthplace}
                            onChange={handleChange}
                            placeholder="Enter your birthplace"
                            className="focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dob" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date of Birth
                          </Label>
                          <Input
                            id="dob"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                            className="focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image" className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Profile Image
                          </Label>
                          <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="focus:ring-teal-500 focus:border-teal-500"
                          />
                          {file && (
                            <p className="text-sm text-green-600">New image selected: {file.name}</p>
                          )}
                        </div>
                      </div>

                      {/* Read-only fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                          <Label className="text-gray-500">Digital ID</Label>
                          <Input
                            value={formData.did}
                            disabled
                            className="bg-gray-50 text-gray-600"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-500">Role</Label>
                          <Input
                            value={formData.role}
                            disabled
                            className="bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={updating}
                          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 transition-colors"
                        >
                          {updating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={cancelEdit}
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Security Note */}
              {!editable && (
                <Card className="shadow-lg border-0 mt-6 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Security Information</h4>
                        <p className="text-blue-700 text-sm">
                          Your profile information is securely stored on the blockchain. 
                          For security reasons, some fields cannot be modified after registration. 
                          Contact system administrators for assistance with account changes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;
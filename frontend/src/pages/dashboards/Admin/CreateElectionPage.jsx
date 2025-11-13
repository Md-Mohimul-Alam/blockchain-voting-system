import React, { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Vote, AlertCircle, CheckCircle } from "lucide-react";
import API from "@/services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateElection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    electionId: "",
    title: "",
    description: "",
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.electionId.trim()) {
      newErrors.electionId = "Election ID is required";
    } else if (formData.electionId.length < 3) {
      newErrors.electionId = "Election ID must be at least 3 characters";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Election title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Election description is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const now = new Date();
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start < now) {
        newErrors.startDate = "Start date cannot be in the past";
      }

      if (end <= start) {
        newErrors.endDate = "End date must be after start date";
      }

      const duration = end - start;
      const minDuration = 30 * 60 * 1000; // 30 minutes
      const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 year

      if (duration < minDuration) {
        newErrors.endDate = "Election must run for at least 30 minutes";
      }

      if (duration > maxDuration) {
        newErrors.endDate = "Election cannot run for more than 1 year";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error("Please fix the errors in the form");
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    const formattedData = {
      electionId: formData.electionId.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
    };

    // Add retry logic
    let retries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to create election...`);
        
        const response = await API.post("/election", formattedData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        });

        if (response.data.success) {
          toast.success("🎉 Election created successfully!");
          // Reset form and navigate
          setFormData({ electionId: "", title: "", description: "", startDate: null, endDate: null });
          const user = JSON.parse(localStorage.getItem("user"));
          setTimeout(() => navigate(`/dashboard/${user?.role?.toLowerCase() || "admin"}`), 1500);
          return;
        }
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
    }
    
    // All retries failed
    throw lastError;

  } catch (error) {
    console.error("❌ All election creation attempts failed:", error);
    
    let errorMessage = "Failed to create election after multiple attempts";
    let suggestion = "Please try again later";
    
    if (error.response?.data?.error?.includes('Blockchain network')) {
      errorMessage = "Blockchain network is currently unavailable";
      suggestion = "Please restart the Fabric network or contact system administrator";
    }
    
    toast.error(errorMessage, { description: suggestion });
  } finally {
    setLoading(false);
  }
};
  const CustomDateInput = ({ value, onClick, error, placeholder }) => (
    <div className="relative">
      <Input
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        className={`cursor-pointer pr-10 ${error ? 'border-red-500' : ''}`}
      />
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );

  const getElectionDuration = () => {
    if (!formData.startDate || !formData.endDate) return null;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = end - start;
    
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex flex-col">
      <Header />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-12 shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Vote className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Create New Election</h1>
          </div>
          <p className="text-xl opacity-90">
            Set up a secure and transparent voting process
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-teal-700 flex items-center justify-center gap-2">
                <Vote className="w-6 h-6" />
                Election Details
              </CardTitle>
              <CardDescription>
                Fill in the details below to create a new election
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Election ID */}
                <div className="space-y-2">
                  <Label htmlFor="electionId" className="text-sm font-semibold">
                    Election ID *
                  </Label>
                  <Input
                    id="electionId"
                    name="electionId"
                    type="text"
                    placeholder="e.g., presidential-2024"
                    value={formData.electionId}
                    onChange={handleChange}
                    className={errors.electionId ? 'border-red-500' : ''}
                  />
                  {errors.electionId && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.electionId}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Unique identifier for the election (letters, numbers, and hyphens only)
                  </p>
                </div>

                {/* Election Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Election Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g., Presidential Election 2024"
                    value={formData.title}
                    onChange={handleChange}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Election Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Election Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the purpose and scope of this election..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`resize-none ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Date & Time Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Start Date & Time *
                    </Label>
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => {
                        setFormData({ ...formData, startDate: date });
                        if (errors.startDate) {
                          setErrors({ ...errors, startDate: "" });
                        }
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      placeholderText="Select start date and time"
                      customInput={<CustomDateInput error={errors.startDate} placeholder="Start date and time" />}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      End Date & Time *
                    </Label>
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => {
                        setFormData({ ...formData, endDate: date });
                        if (errors.endDate) {
                          setErrors({ ...errors, endDate: "" });
                        }
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={formData.startDate || new Date()}
                      placeholderText="Select end date and time"
                      customInput={<CustomDateInput error={errors.endDate} placeholder="End date and time" />}
                    />
                  </div>
                </div>

                {/* Duration Display */}
                {formData.startDate && formData.endDate && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-teal-800">Election Duration:</span>
                      <span className="text-sm font-semibold text-teal-700">
                        {getElectionDuration()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Election...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Create Election
                      </div>
                    )}
                  </Button>
                </div>

                {/* Form Requirements */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Election ID must be unique and at least 3 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Start date must be in the future
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      End date must be after start date
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      Minimum election duration: 30 minutes
                    </li>
                  </ul>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateElection;
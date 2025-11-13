import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Vote, Eye, EyeOff, User, Shield, Calendar, MapPin, Key, Upload } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.string().min(1, "Please select a role"),
  did: z.string().min(1, "DID is required"),
  dob: z.string().min(1, "Date of birth is required"),
  birthplace: z.string().min(2, "Birthplace must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  image: z.any().optional(),
});

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      role: "",
      did: "",
      dob: "",
      birthplace: "",
      password: "",
      image: null,
    }
  });

  const togglePassword = () => setShowPassword(!showPassword);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log("📝 Registration data:", data);
      
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("role", data.role);
      formData.append("did", data.did);
      formData.append("dob", new Date(data.dob).toISOString().split("T")[0]);
      formData.append("birthplace", data.birthplace);
      formData.append("password", data.password);
      
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      const response = await API.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Registration response:", response.data);

      toast({ 
        title: "Registration successful! 🎉", 
        description: "Your account has been created on the blockchain. You can now log in." 
      });
      
      // Reset form
      form.reset();
      setSelectedImage(null);
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("❌ Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      form.setValue("image", e.target.files);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <Card className="w-full bg-white/80 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full">
                  <Vote className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">
                Join Vote-Chain
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Register for secure, transparent blockchain-based elections
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column */}
                    <div className="space-y-5">
                      {/* Full Name */}
                      <FormField 
                        control={form.control} 
                        name="fullName" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <User className="w-4 h-4" />
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your full name" 
                                {...field} 
                                disabled={isLoading}
                                className="bg-white border-gray-300 focus:border-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />

                      {/* Username */}
                      <FormField 
                        control={form.control} 
                        name="username" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <User className="w-4 h-4" />
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                {...field} 
                                disabled={isLoading}
                                className="bg-white border-gray-300 focus:border-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />

                      {/* Role */}
                      <FormField 
                        control={form.control} 
                        name="role" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <Shield className="w-4 h-4" />
                              Role
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border border-gray-300">
                                <SelectItem value="Voter" className="hover:bg-teal-50 focus:bg-teal-50">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Voter
                                  </div>
                                </SelectItem>
                                <SelectItem value="Candidate" className="hover:bg-teal-50 focus:bg-teal-50">
                                  <div className="flex items-center gap-2">
                                    <Vote className="w-4 h-4" />
                                    Candidate
                                  </div>
                                </SelectItem>
                                <SelectItem value="Admin" className="hover:bg-teal-50 focus:bg-teal-50">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="ElectionCommission" className="hover:bg-teal-50 focus:bg-teal-50">
                                  <div className="flex items-center gap-2">
                                    <Vote className="w-4 h-4" />
                                    Election Commission
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose your role in the voting system
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />

                      {/* DID */}
                      <FormField 
                        control={form.control} 
                        name="did" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <Key className="w-4 h-4" />
                              Decentralized ID (DID)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your unique blockchain ID" 
                                {...field} 
                                disabled={isLoading}
                                className="bg-white border-gray-300 focus:border-teal-500 font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              Your unique identifier on the blockchain
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                      {/* Date of Birth */}
                      <FormField 
                        control={form.control} 
                        name="dob" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4" />
                              Date of Birth
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                disabled={isLoading}
                                className="bg-white border-gray-300 focus:border-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />

                      {/* Birthplace */}
                      <FormField 
                        control={form.control} 
                        name="birthplace" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-4 h-4" />
                              Birthplace
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="City, Country" 
                                {...field} 
                                disabled={isLoading}
                                className="bg-white border-gray-300 focus:border-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />

                      {/* Password */}
                      <FormField 
                        control={form.control} 
                        name="password" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <Key className="w-4 h-4" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a strong password"
                                  {...field}
                                  disabled={isLoading}
                                  className="bg-white border-gray-300 focus:border-teal-500 pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors"
                                  onClick={togglePassword}
                                  disabled={isLoading}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Minimum 6 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />

                      {/* Profile Image */}
                      <FormField 
                        control={form.control} 
                        name="image" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-700">
                              <Upload className="w-4 h-4" />
                              Profile Image
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                <Input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleImageChange}
                                  disabled={isLoading}
                                  className="bg-white border-gray-300 focus:border-teal-500"
                                />
                                {selectedImage && (
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={selectedImage} 
                                      alt="Profile preview" 
                                      className="w-16 h-16 rounded-full object-cover border-2 border-teal-200"
                                    />
                                    <span className="text-sm text-teal-600">Image selected</span>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Optional: Upload a profile picture
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} 
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-8">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Registering on Blockchain...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Vote className="w-5 h-5" />
                          Create Blockchain Account
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Form>

            <CardFooter className="flex justify-center border-t border-gray-200 pt-6">
              <div className="text-center">
                <p className="text-gray-600">
                  Already have a blockchain account?{" "}
                  <Link 
                    to="/login" 
                    className="text-teal-600 hover:text-teal-800 font-semibold transition-colors underline"
                  >
                    Sign in to Vote-Chain
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-white/60 backdrop-blur-sm border-0 text-center p-4">
              <Shield className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Secure & Private</h3>
              <p className="text-sm text-gray-600">Blockchain-powered security</p>
            </Card>
            <Card className="bg-white/60 backdrop-blur-sm border-0 text-center p-4">
              <Vote className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Transparent</h3>
              <p className="text-sm text-gray-600">Verifiable voting process</p>
            </Card>
            <Card className="bg-white/60 backdrop-blur-sm border-0 text-center p-4">
              <User className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Decentralized</h3>
              <p className="text-sm text-gray-600">No single point of failure</p>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
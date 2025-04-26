// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Vote, Eye, EyeOff } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api"; // 🔗 Import the API service

const loginSchema = z.object({
  role: z.string().min(3, { message: "Role is required" }),
  did: z.string().min(1, { message: "DID is required" }),
  dob: z.string().min(4, { message: "Date of Birth is required" }),
  username: z.string().min(1, { message: "Username must be at least 1 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});



const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "",
      did: "",
      dob: "",
      username: "",
      password: "",
    }    
  });


  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await API.post("/login", data);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
  
      toast({
        title: "Login successful!",
        description: `Welcome ${user.fullName || user.username}!`,
      });
  
      // ✅ Redirect to role-based dashboard
      navigate(`/dashboard/${user.role.toLowerCase()}`);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };  
    
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="container px-4 max-w-md">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Vote className="h-12 w-12 text-teal-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Sign in to Vote-Chain
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="did"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your DID" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border border-gray-300 rounded"
                            disabled={isLoading}
                          >
                            <option value="">Select role</option>
                            <option value="Voter">Voter</option>
                            <option value="Candidate">Candidate</option>
                            <option value="Admin">Admin</option>
                            <option value="Electioncommunity">Election Community</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="YYYY-MM-DD"
                            type="date"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-right">
                    <Link to="/forgot-password" className="text-teal-600 hover:text-teal-800">
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Don&apos;t have an account? <Link to="/register" className="text-teal-600 hover:text-teal-800 font-medium">Register</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;

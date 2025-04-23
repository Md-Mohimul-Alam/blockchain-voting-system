import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote, Calendar, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";

// Form schema (without TypeScript types)
const registerSchema = {
  fullName: "",
  username: "",
  role: "Voter",
  did: "",
  dob: new Date(),
  birthplace: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm({
    defaultValues: registerSchema,
  });

  // Form submission handler

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Convert image to FormData
      const formData = new FormData();
      formData.append("role", data.role);
      formData.append("did", data.did);
      formData.append("fullName", data.fullName);
      formData.append("dob", new Date(data.dob).toISOString());
      formData.append("birthplace", data.birthplace);
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("image", data.image[0]); // File input

      const response = await API.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.error || "Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="container px-4 max-w-lg">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Vote className="h-12 w-12 text-teal-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Create an Account
              </CardTitle>
              <CardDescription className="text-center">
                Register to participate in secure blockchain-based elections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be used to log in to your account.
                        </FormDescription>
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
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          disabled={isLoading}
                        >
                          <FormControl >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-teal-600 text-white">
                            <SelectItem className="bg-teal-600 hover:bg-teal-700 text-white" value="voter">Voter</SelectItem>
                            <SelectItem className="bg-teal-600 hover:bg-teal-700 text-white" value="candidate">Candidate</SelectItem>
                            <SelectItem className="bg-teal-600 hover:bg-teal-700 text-white" value="admin">Admin</SelectItem>
                            <SelectItem className="bg-teal-600 hover:bg-teal-700 text-white" value="electioncommunity">Election Community</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
                                  disabled={isLoading}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="bg-teal-600 hover:bg-teal-700 text-white" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent className="bg-teal-600 hover:bg-teal-700 text-white"
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthplace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birthplace</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City, Country" 
                              {...field} 
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                              placeholder="Create a strong password"
                              {...field}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Must be at least 8 characters long.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              {...field}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={toggleConfirmPasswordVisibility}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the{" "}
                            <Link
                              to="/terms"
                              className="text-teal-600 hover:text-teal-800"
                            >
                              terms and conditions
                            </Link>
                          </FormLabel>
                          <FormDescription>
                            Your data will be securely stored and only used for election verification.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-teal-600 hover:text-teal-800 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;

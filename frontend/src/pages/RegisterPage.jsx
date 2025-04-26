import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
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
import { Vote,Eye, EyeOff } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const registerSchema = {
  fullName: "",
  username: "",
  role: "",
  did: "",
  dob: "",
  birthplace: "",
  password: "",
  image: null,
};

const Register = () => {
  const form = useForm({ defaultValues: registerSchema });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("role", data.role);
      formData.append("did", data.did);
      formData.append("dob", new Date(data.dob).toISOString().split("T")[0]);
      formData.append("birthplace", data.birthplace);
      formData.append("password", data.password);
      formData.append("image", data.image[0]);

      await API.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Registration successful!", description: "You can now log in." });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.error || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100 py-12">
        <div className="w-full max-w-5xl px-4">
          <Card className="w-full bg-zinc-50">
            <Form {...form} >
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent p-6 rounded ">

                <div className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <div className="border-2 border-solid rounded-md">
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-teal-600">
                            <SelectItem value="Voter" className="bg-teal-600 hover:bg-teal-700">Voter</SelectItem>
                            <SelectItem value="Candidate" className="bg-teal-600 hover:bg-teal-700">Candidate</SelectItem>
                            <SelectItem value="Admin" className="bg-teal-600 hover:bg-teal-700">Admin</SelectItem>
                            <SelectItem value="ElectionCommunity" className="bg-teal-600 hover:bg-teal-700">Election Community</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="did" render={({ field }) => (
                    <FormItem>
                      <FormLabel>DID</FormLabel>
                      <FormControl>
                        <Input placeholder="DID (Decentralized ID)" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="dob" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-4">
                  <FormField control={form.control} name="birthplace" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthplace</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            {...field}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={togglePassword}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </div>
                
              </form>
              <CardFooter className="flex justify-center align-center">
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
            </Form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;

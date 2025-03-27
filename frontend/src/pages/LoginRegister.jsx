import { useState, useEffect } from "react";
import { loginUser, registerUser, loginAdmin, registerAdmin } from "../api/api";
import { useNavigate } from "react-router-dom";

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register views
  const [userData, setUserData] = useState({
    role: "admin", // Default role is Admin; changes based on user selection
    did: "",
    userName: "",
    dob: "",
    password: "",
    name: "", // Only required for user registration
    birthplace: "", // Only required for user registration
  });

  const navigate = useNavigate();

  // Synchronize authentication state with localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserData((prevState) => ({ ...prevState, role: storedRole }));
    }
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Handle form submission for Login/Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login Flow
        if (userData.role === "admin") {
          const response = await loginAdmin(userData); // Ensure API returns response
          console.log("Admin login response:", response); // Log the response
          localStorage.setItem("userRole", "admin"); // Save role to localStorage
          alert("Admin login successful!");
          navigate("/admin-dashboard"); // Navigate to Admin Dashboard
        } else {
          const response = await loginUser(userData); // Ensure API returns response
          console.log("User login response:", response); // Log the response
          localStorage.setItem("userRole", "user"); // Save role to localStorage
          alert("User login successful!");
          navigate("/user-dashboard"); // Navigate to User Dashboard
        }
      } else {
        // Register Flow
        if (userData.role === "admin") {
          await registerAdmin(userData);
          alert("Admin registration successful!");
          setIsLogin(true); // Switch to Login view
        } else {
          await registerUser(userData);
          alert("User registration successful!");
          setIsLogin(true); // Switch to Login view
        }
      }
    } catch (error) {
      console.error("Error during login/register:", error);
      alert("An error occurred during the process. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Display branding and info */}
      <div className="w-1/2 bg-sky-950 text-white flex flex-col justify-center items-center p-10">
        <div className="text-3xl text-white font-bold">Secure Blockchain Voting</div>
        <p className="mt-4 text-gray-400">Login or Register to vote securely.</p>
      </div>

      {/* Right Section - Login/Register Form */}
      <div className="w-1/2 flex justify-center items-center rounded-lg">
        <div className="bg-white shadow-lg rounded-xl p-8 w-96">
          {/* Form Header */}
          <div className="flex justify-center items-center p-2 font-medium uppercase text-neutral-700">
            {isLogin ? "Login" : "Register"}
          </div>

          {/* Toggle between Login and Register */}
          <div className="flex justify-center items-center mb-4">
            <div
              onClick={() => setIsLogin(true)}
              className={`flex justify-center items-center pb-2 pr-5 text-lg ${
                isLogin ? "border-b-2 border-black font-bold" : "text-gray-500"
              } bg-transparent hover:bg-gray-200 transition`}
            >
              <div className="pl-5">Login</div>
            </div>
            <div
              onClick={() => setIsLogin(false)}
              className={`flex justify-center items-center pb-2 pr-5 text-lg ${
                !isLogin ? "border-b-2 border-black font-bold" : "text-gray-500"
              } bg-transparent hover:bg-gray-200 transition`}
            >
              <div className="pl-5">Register</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <select
              name="role"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            {/* DID */}
            <input
              type="text"
              name="did"
              placeholder="DID"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

            {/* Username */}
            <input
              type="text"
              name="userName"
              placeholder="Username"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

            {/* Name (only for User registration) */}
            {!isLogin && userData.role === "user" && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="border p-2 w-full rounded-lg"
                onChange={handleChange}
                required
              />
            )}

            {/* Date of Birth */}
            <input
              type="date"
              name="dob"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

            {/* Birthplace (only for User registration) */}
            {!isLogin && userData.role === "user" && (
              <input
                type="text"
                name="birthplace"
                placeholder="Birthplace"
                className="border p-2 w-full rounded-lg"
                onChange={handleChange}
                required
              />
            )}

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;

import { useState, useEffect } from "react";
import { loginUser, registerUser, loginAdmin, registerAdmin } from "../api/api";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../Context/AuthContext"; // Import useAuth to use authentication context

const LoginRegister = () => {
  const { login } = useAuth(); // Destructure login function from AuthContext
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isLogin) {
        // Login Flow
        if (userData.role === "admin") {
          response = await loginAdmin(userData);
        } else {
          response = await loginUser(userData);
        }

        console.log("Login Response:", response);  // Log entire response object

        // Check if the response contains the expected fields
        if (!response || !response.data || !response.data.token || !response.data.did || !response.data.role) {
          throw new Error("Invalid response data");
        }

        // Extract token, did, and role from the response
        const { token, did, role } = response.data;

        // Save JWT token, DID, and userRole in localStorage
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("did", did); // Save DID to localStorage
        localStorage.setItem("userRole", role); // Save user role

        alert(`${role} login successful!`);

        // Call the login function from AuthContext to update the global state
        login(token, role, did);

        // Redirect to the appropriate dashboard based on the role
        if (role === "admin") {
          navigate("/admin-dashboard");  // Admin dashboard
        } else if (role === "user") {
          navigate("/user-dashboard");  // User dashboard
        }
      } else {
        // Register Flow
        if (userData.role === "admin") {
          await registerAdmin(userData);
          alert("Admin registration successful!");
        } else {
          const response = await registerUser(userData);

          console.log("Registration Response:", response);  // Log entire response object

          // Ensure the response contains the correct `did`, `jwtToken`, and `role`
          const { did, token, role } = response.data;

          // Save the DID and JWT to localStorage after registration
          localStorage.setItem("did", did); // Save DID from the response
          localStorage.setItem("jwtToken", token); // Save JWT token
          localStorage.setItem("userRole", role); // Save user role
          alert("User registration successful!");

          // Call the login function from AuthContext to update the global state
          login(token, role, did);
        }
        setIsLogin(true); // Switch to Login view
      }
    } catch (error) {
      console.error("Error during login/register:", error);
      alert("An error occurred during the process. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-sky-950 text-white flex flex-col justify-center items-center p-10">
        <div className="text-3xl text-white font-bold">Secure Blockchain Voting</div>
        <p className="mt-4 text-gray-400">Login or Register to vote securely.</p>
      </div>

      <div className="w-1/2 flex justify-center items-center rounded-lg">
        <div className="bg-white shadow-lg rounded-xl p-8 w-96">
          <div className="flex justify-center items-center p-2 font-medium uppercase text-neutral-700">
            {isLogin ? "Login" : "Register"}
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <input
              type="text"
              name="did"
              placeholder="DID"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="userName"
              placeholder="Username"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

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

            <input
              type="date"
              name="dob"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

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

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border p-2 w-full rounded-lg"
              onChange={handleChange}
              required
            />

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
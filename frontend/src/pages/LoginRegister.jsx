import { useState, useEffect } from "react";
import { loginUser, registerUser, loginAdmin, registerAdmin } from "../api/api";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const LoginRegister = () => {
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserData((prevState) => ({ ...prevState, role: storedRole }));
    }
  }, []);
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
        let response;
        if (userData.role === "admin") {
          response = await loginAdmin(userData);
          localStorage.setItem("userRole", "admin");
        } else {
          response = await loginUser(userData);
          localStorage.setItem("userRole", "user");
        }

        // Save JWT token in localStorage
        localStorage.setItem("jwtToken", response.data.token); // Save token in localStorage
        alert(`${userData.role} login successful!`);
        navigate(userData.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      } else {
        // Register Flow
        if (userData.role === "admin") {
          await registerAdmin(userData);
          alert("Admin registration successful!");
        } else {
          await registerUser(userData);
          alert("User registration successful!");
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

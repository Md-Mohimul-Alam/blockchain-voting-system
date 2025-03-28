import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi"; // Import hamburger icons
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Either "admin" or "user"
  const navigate = useNavigate();

  // Check if the user is logged in and persist login state
  useEffect(() => {
    const token = localStorage.getItem("jwtToken"); // Check for token in localStorage
    const storedRole = localStorage.getItem("userRole");
    
    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  // Logout Function
  const handleLogout = () => {
    // Clear role and authentication state
    localStorage.removeItem("userRole"); // Remove role from localStorage
    localStorage.removeItem("jwtToken"); // Optionally, remove JWT token
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/auth"); // Redirect to login/register page
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
      {/* Logo and Title */}
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-center items-center space-x-6">
          <HiMenu className="h-6 w-6 text-white" />
          <img
            src="/logo.jpg" // Replace with the actual path to your logo
            alt="Blockchain Voting System Logo"
            className="h-15 w-15 object-contain"
          />
          <h5 className="text-xl font-extrabold text-white">Blockchain Voting System</h5>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden lg:flex text-white">
        {/* Home Link */}
        <Link to="/" className="mr-6 text-lg text-white hover:text-gray-300 transition">
          Home
        </Link>

        {isAuthenticated ? (
          <>
            {/* Dashboard Link */}
            <Link
              to={userRole === "admin" ? "/admin-dashboard" : "/user-dashboard"}
              className="mr-6 text-lg text-white hover:text-gray-300 transition"
            >
              Dashboard
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-lg text-white hover:text-gray-300 transition bg-transparent border-none"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Login/Register Link */}
            <Link to="/auth" className="text-lg text-white hover:text-gray-300 transition">
              Login/Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
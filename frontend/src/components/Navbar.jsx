import { useAuth } from "../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu } from "react-icons/hi"; // Import hamburger icon

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();

  // Logout function to clear localStorage and update state
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-center items-center space-x-6">
          <HiMenu className="h-6 w-6 text-white" />
          <img
            src="/logo.jpg"
            alt="Blockchain Voting System Logo"
            className="h-15 w-15 object-contain"
          />
          <h5 className="text-xl font-extrabold text-white">Blockchain Voting System</h5>
        </div>
      </div>

      <div className="hidden lg:flex text-white">
        <Link to="/" className="mr-6 pt-2 text-lg text-white hover:text-gray-300 transition">
          Home
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to={userRole === "admin" ? "/admin-dashboard" : "/user-dashboard"}
              className="mr-6 pt-2 text-lg text-white hover:text-gray-300 transition"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="text-lg text-white hover:text-gray-300 transition bg-transparent border-none"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="text-lg text-white hover:text-gray-300 transition">
            Login/Register
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
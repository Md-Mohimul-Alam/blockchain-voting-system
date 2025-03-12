import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      <h1>Blockchain Based Voting System</h1>
      <ul>
        <li className="nav-links"><Link to="/">Home</Link></li>
        {token ? (
          <>
            <li  className="nav-links"><Link to="/dashboard">Dashboard</Link></li>
            <li  className="nav-links"><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li className="nav-links"><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      {user?.role === 'user' && <Link to="/vote">Vote</Link>}
      <Link to="/results">Results</Link>
      {user ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
    </nav>
  );
};
export default Navbar;
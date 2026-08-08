import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-text">Dance Baby Dance</span>
        </Link>
      </div>
      
      <div className="navbar-search">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search for a song..." className="search-input" />
        </div>
      </div>
      
      <div className="navbar-links">
        <Link to="/dance" className="nav-link">Dance Stage</Link>
        {currentUser && (
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        )}
        
        {currentUser ? (
          <button onClick={handleLogout} className="glass-btn login-btn">Logout</button>
        ) : (
          <Link to="/login" className="glass-btn login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

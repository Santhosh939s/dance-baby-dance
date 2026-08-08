import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { searchYouTube } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const data = await searchYouTube(query);
      setResults(data);
    } catch (error) {
      console.error("Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectVideo = (videoId) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/dance?v=${videoId}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-text">Dance Baby Dance</span>
        </Link>
      </div>
      
      <div className="navbar-search" ref={searchRef}>
        <div className="search-input-container">
          <Search size={18} className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
          <input 
            type="text" 
            placeholder="Search for a song..." 
            className="search-input" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isSearching && <Loader size={16} className="search-spinner" />}
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="search-results-dropdown glass-panel">
            {isSearching ? (
              <div className="search-status">Searching...</div>
            ) : results.length > 0 ? (
              results.map(video => (
                <div 
                  key={video.videoId} 
                  className="search-result-item"
                  onClick={() => handleSelectVideo(video.videoId)}
                >
                  <img src={video.thumbnail} alt={video.title} className="result-thumb" />
                  <div className="result-info">
                    <div className="result-title" dangerouslySetInnerHTML={{ __html: video.title }}></div>
                    <div className="result-channel">{video.channelTitle}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-status">No results found</div>
            )}
          </div>
        )}
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

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFavorites, getUserDanceHistory } from '../../services/db';
import { checkYouTubeConnection } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [youtubeConnected, setYoutubeConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const favs = await getUserFavorites(currentUser.uid);
          const hist = await getUserDanceHistory(currentUser.uid);
          const ytStatus = await checkYouTubeConnection(currentUser.uid);
          
          setFavorites(favs);
          setHistory(hist);
          
          // Also check query param if we just returned from OAuth
          if (searchParams.get('youtube_connected') === 'true') {
            setYoutubeConnected(true);
          } else {
            setYoutubeConnected(ytStatus);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [currentUser, searchParams]);

  const handleConnectYouTube = () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_BASE}/oauth/google?uid=${currentUser.uid}`;
  };

  if (loading) {
    return <div className="dashboard-page animate-fade-in"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="dashboard-header">
        <h1 className="title">My Dashboard</h1>
        <p className="subtitle">Welcome back, {currentUser?.displayName || 'Dancer'}!</p>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-section glass-panel">
          <h2>Integrations</h2>
          <div className="integration-card">
            <div className="integration-info">
              <h3>YouTube</h3>
              <p>Connect your account for personalized recommendations and saved playlists.</p>
            </div>
            {youtubeConnected ? (
              <span className="status-badge connected">Connected ✅</span>
            ) : (
              <button className="primary-btn small-btn" onClick={handleConnectYouTube}>
                Connect YouTube
              </button>
            )}
          </div>
        </section>

        <section className="dashboard-section glass-panel">
          <h2>Dance Progress</h2>
          {history.length === 0 ? (
            <div className="empty-state">
              <p>You haven't danced to any songs yet.</p>
              <Link to="/dance" className="primary-btn small-btn mt-1">Find a Song</Link>
            </div>
          ) : (
            <div className="progress-list">
              {history.map(song => (
                <div key={song.id} className="progress-item">
                  <div className="progress-info">
                    <span className="song-title">{song.songId}</span>
                    <span className="song-progress-text">{song.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${song.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section glass-panel">
          <h2>Favorites</h2>
          {favorites.length === 0 ? (
            <div className="empty-state">
              <p>No favorites saved yet.</p>
            </div>
          ) : (
            <div className="favorites-list">
              {favorites.map(fav => (
                <div key={fav.id} className="favorite-item">
                  <div className="favorite-icon">🎵</div>
                  <div className="favorite-details">
                    <h4>{fav.title}</h4>
                    <p>{fav.artist}</p>
                  </div>
                  <Link to="/dance" className="glass-btn small-btn">Dance</Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

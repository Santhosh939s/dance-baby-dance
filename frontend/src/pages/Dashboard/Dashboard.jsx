import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data
  const recentlyDanced = [
    { id: 1, title: "Butta Bomma", artist: "Armaan Malik", progress: 80 },
    { id: 2, title: "Srivalli", artist: "Javed Ali", progress: 60 },
    { id: 3, title: "Blinding Lights", artist: "The Weeknd", progress: 30 }
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="dashboard-header">
        <h1 className="title">My Dashboard</h1>
        <p className="subtitle">Welcome back, Dancer!</p>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-section glass-panel">
          <h2>Dance Progress</h2>
          <div className="progress-list">
            {recentlyDanced.map(song => (
              <div key={song.id} className="progress-item">
                <div className="progress-info">
                  <span className="song-title">{song.title}</span>
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
        </section>

        <section className="dashboard-section glass-panel">
          <h2>Favorites</h2>
          <div className="favorites-list">
            <div className="favorite-item">
              <div className="favorite-icon">🎵</div>
              <div className="favorite-details">
                <h4>Shape of You</h4>
                <p>Ed Sheeran</p>
              </div>
              <Link to="/dance" className="glass-btn small-btn">Dance</Link>
            </div>
            <div className="favorite-item">
              <div className="favorite-icon">🎵</div>
              <div className="favorite-details">
                <h4>Levitating</h4>
                <p>Dua Lipa</p>
              </div>
              <Link to="/dance" className="glass-btn small-btn">Dance</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

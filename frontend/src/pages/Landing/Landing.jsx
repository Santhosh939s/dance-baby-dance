import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page animate-fade-in">
      <section className="hero">
        <div className="hero-content">
          <h1 className="title hero-title">DANCE BABY DANCE</h1>
          <p className="subtitle hero-subtitle">Your AI Dance Partner</p>
          <div className="hero-description">
            <p>Listen to your favorite songs.</p>
            <p>Watch. Learn. Dance.</p>
          </div>
          <Link to="/dance" className="primary-btn hero-cta">
            LET'S DANCE
          </Link>
        </div>
        
        <div className="hero-visual">
          <div className="placeholder-avatar-group">
            <div className="placeholder-avatar male-avatar">🕺</div>
            <div className="placeholder-avatar female-avatar">💃</div>
          </div>
          <div className="glow-effect"></div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">🔍</div>
            <h3>1. Search a song</h3>
            <p>Find your favorite track to dance to.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">👀</div>
            <h3>2. Watch</h3>
            <p>Watch the avatars perform the AI choreography.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🎓</div>
            <h3>3. Teach Me</h3>
            <p>Click Teach Me to learn every step from the instructor.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

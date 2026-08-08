import Avatar from '../Avatar/Avatar';
import './TeachMode.css';

const TeachMode = ({ onExit }) => {
  return (
    <div className="teach-mode animate-fade-in">
      <div className="teach-header">
        <h2 className="title teach-title">TEACH MODE</h2>
        <button className="secondary-btn exit-btn" onClick={onExit}>
          Exit Teach Mode
        </button>
      </div>

      <div className="teach-stage">
        <Avatar type="male" role="instructor" isDancing={true} activeMovement="Raise right hand" />
        <Avatar type="female" role="mirror" isDancing={true} activeMovement="Raise left hand" />
      </div>

      <div className="teach-controls glass-panel">
        <div className="step-info">
          <span className="step-counter">Step 3 / 8</span>
          <h3 className="step-instruction">Raise your right hand</h3>
        </div>

        <div className="step-progress">
          <div className="dot completed"></div>
          <div className="dot completed"></div>
          <div className="dot active"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>

        <div className="playback-controls">
          <button className="control-btn">← Previous</button>
          <button className="control-btn">🔁 Repeat</button>
          <button className="control-btn play-demo-btn">▶ Demonstrate</button>
          <button className="control-btn">Next →</button>
        </div>

        <div className="speed-controls">
          <span>Speed:</span>
          <div className="speed-options">
            <button className="speed-btn">0.25x</button>
            <button className="speed-btn">0.5x</button>
            <button className="speed-btn">0.75x</button>
            <button className="speed-btn active">1x</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachMode;

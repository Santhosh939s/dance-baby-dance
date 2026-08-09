import { useState, useEffect } from 'react';
import './MusicPlayer.css';

const MusicPlayer = ({ player, onPlayPause }) => {
  const [currentTime, setCurrentTime] = useState(0);

  // Sync current time periodically when playing
  useEffect(() => {
    let interval;
    if (player && player.isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
      }, 1000);
    } else if (player) {
      setCurrentTime(player.getCurrentTime());
    }
    return () => clearInterval(interval);
  }, [player, player?.isPlaying]);

  if (!player || !player.videoId) return null;

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = player.duration > 0 ? (currentTime / player.duration) * 100 : 0;

  return (
    <div className="music-player glass-panel">
      <div className="player-info">
        <div className="song-thumbnail">
          <div className="play-icon">🎵</div>
        </div>
        <div className="song-details">
          <h4>Now Playing</h4>
          <p>YouTube Video</p>
        </div>
      </div>
      
      <div className="player-controls">
        <button 
          className="control-btn" 
          title="Previous"
          onClick={() => player.seekTo(0)}
        >⏮</button>
        <button 
          className="control-btn play-btn" 
          onClick={onPlayPause}
          title={player.isPlaying ? "Pause" : "Play"}
        >
          {player.isPlaying ? '⏸' : '▶'}
        </button>
        <button className="control-btn" title="Next">⏭</button>
      </div>
      
      <div className="player-progress">
        <span className="time">{formatTime(currentTime)}</span>
        <div className="progress-bar-container">
          <input 
            type="range" 
            min="0" 
            max={player.duration || 100}
            value={currentTime}
            onChange={(e) => player.seekTo(parseFloat(e.target.value))}
            className="seek-slider"
            style={{ 
              background: `linear-gradient(to right, var(--primary) ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%)` 
            }}
          />
        </div>
        <span className="time">{formatTime(player.duration)}</span>
      </div>
    </div>
  );
};

export default MusicPlayer;

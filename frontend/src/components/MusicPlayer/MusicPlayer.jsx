import './MusicPlayer.css';

const MusicPlayer = ({ song, isPlaying, onPlayPause }) => {
  if (!song) return null;

  return (
    <div className="music-player glass-panel">
      <div className="player-info">
        <div className="song-thumbnail">
          <div className="play-icon">▶</div>
        </div>
        <div className="song-details">
          <h4>{song.title}</h4>
          <p>{song.artist}</p>
        </div>
      </div>
      
      <div className="player-controls">
        <button className="control-btn" title="Previous">⏮</button>
        <button 
          className="control-btn play-btn" 
          onClick={onPlayPause}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="control-btn" title="Next">⏭</button>
      </div>
      
      <div className="player-progress">
        <span className="time">0:45</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '30%' }}></div>
        </div>
        <span className="time">3:12</span>
      </div>
    </div>
  );
};

export default MusicPlayer;

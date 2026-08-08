import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import DanceStage from '../../components/DanceStage/DanceStage';
import MusicPlayer from '../../components/MusicPlayer/MusicPlayer';
import TeachMode from '../../components/TeachMode/TeachMode';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import './Dance.css';

const Dance = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  const [isTeachMode, setIsTeachMode] = useState(false);
  
  const player = useYouTubePlayer();

  useEffect(() => {
    if (videoId) {
      player.setVideoId(videoId);
    }
  }, [videoId, player.setVideoId]);

  const handlePlayPause = () => {
    if (player.isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const opts = {
    height: '180',
    width: '320',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0
    },
  };

  if (isTeachMode) {
    return <TeachMode onExit={() => setIsTeachMode(false)} player={player} />;
  }

  return (
    <div className="dance-page animate-fade-in">
      <div className="dance-content">
        
        <div className="stage-area">
          <DanceStage isPlaying={player.isPlaying} />
          
          {/* Floating YouTube Player */}
          <div className="floating-youtube-container glass-panel">
            {videoId ? (
              <YouTube 
                videoId={videoId} 
                opts={opts} 
                onReady={player.onReady}
                onStateChange={player.onStateChange}
                onPlaybackRateChange={player.onPlaybackRateChange}
                className="youtube-player"
              />
            ) : (
              <div className="empty-youtube-state">
                <p>No song selected</p>
                <span>Search for a song to start dancing</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="controls-area">
          <MusicPlayer 
            player={player}
            onPlayPause={handlePlayPause} 
          />
          
          <button 
            className="primary-btn teach-me-btn"
            onClick={() => setIsTeachMode(true)}
            disabled={!videoId}
          >
            🎓 TEACH ME
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dance;

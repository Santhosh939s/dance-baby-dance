import { useState } from 'react';
import DanceStage from '../../components/DanceStage/DanceStage';
import MusicPlayer from '../../components/MusicPlayer/MusicPlayer';
import TeachMode from '../../components/TeachMode/TeachMode';
import './Dance.css';

const Dance = () => {
  const [isTeachMode, setIsTeachMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Mock song
  const currentSong = {
    title: "Butta Bomma",
    artist: "Armaan Malik",
    duration: 192
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isTeachMode) {
    return <TeachMode onExit={() => setIsTeachMode(false)} />;
  }

  return (
    <div className="dance-page animate-fade-in">
      <div className="dance-content">
        
        <div className="stage-area">
          <DanceStage isPlaying={isPlaying} />
        </div>
        
        <div className="controls-area">
          <MusicPlayer 
            song={currentSong} 
            isPlaying={isPlaying} 
            onPlayPause={handlePlayPause} 
          />
          
          <button 
            className="primary-btn teach-me-btn"
            onClick={() => setIsTeachMode(true)}
          >
            🎓 TEACH ME
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dance;

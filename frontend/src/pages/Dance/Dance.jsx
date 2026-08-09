import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import DanceStage from '../../components/DanceStage/DanceStage';
import MusicPlayer from '../../components/MusicPlayer/MusicPlayer';
import TeachMode from '../../components/TeachMode/TeachMode';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDanceHistory, updateDanceProgress } from '../../services/db';
import { Clock } from 'lucide-react';
import './Dance.css';

const Dance = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  const navigate = useNavigate();
  const [isTeachMode, setIsTeachMode] = useState(false);
  const [history, setHistory] = useState([]);
  
  // AI States
  const [aiState, setAiState] = useState('IDLE'); // IDLE, UPLOADING, GENERATING, APPLYING_MOTION, READY, ERROR
  const [aiMode, setAiMode] = useState('replay'); // mint, replay, mock, fixture
  const [aiMotionData, setAiMotionData] = useState(null);
  
  const player = useYouTubePlayer();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (videoId) {
      player.setVideoId(videoId);
    }
  }, [videoId, player.setVideoId]);

  useEffect(() => {
    if (currentUser) {
      getUserDanceHistory(currentUser.uid).then(setHistory).catch(console.error);
    }
  }, [currentUser]);

  // Save to history when player is ready and we have the title
  useEffect(() => {
    if (currentUser && player.isReady && player.title && player.videoId) {
      const saveHistory = async () => {
        // Prevent duplicate consecutive saves in history
        if (history.length > 0 && history[0].videoId === player.videoId) return;
        
        try {
          await updateDanceProgress(currentUser.uid, {
            videoId: player.videoId,
            title: player.title,
            thumbnail: `https://i.ytimg.com/vi/${player.videoId}/hqdefault.jpg`,
          });
          // Refresh history
          const updatedHistory = await getUserDanceHistory(currentUser.uid);
          setHistory(updatedHistory);
        } catch (error) {
          console.error("Failed to update history", error);
        }
      };
      saveHistory();
    }
  }, [currentUser, player.isReady, player.videoId, player.title]);

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
          <DanceStage playerState={player} aiMotionData={aiMotionData} aiMode={aiMode} />
          
          {/* History Sidebar */}
          {currentUser && history.length > 0 && (
            <div className="history-sidebar glass-panel">
              <h3 className="history-title"><Clock size={16} /> Recent Dances</h3>
              <div className="history-list">
                {history.slice(0, 5).map(item => (
                  <div 
                    key={item.id} 
                    className="history-item"
                    onClick={() => navigate(`/dance?v=${item.videoId}`)}
                  >
                    <img src={item.thumbnail} alt={item.title} className="history-thumb" />
                    <div className="history-info">
                      <span className="history-song-title">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          
          <div className="ai-controls glass-panel" style={{ marginTop: '10px', padding: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#00ffcc' }}>AI Choreography</h4>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <select 
                value={aiMode} 
                onChange={(e) => setAiMode(e.target.value)}
                style={{ background: '#222', color: '#fff', padding: '5px', borderRadius: '4px', border: '1px solid #444' }}
              >
                <option value="mint">REAL (mint-main, ~2m)</option>
                <option value="replay">REPLAY (last inference)</option>
                <option value="mock">MOCK (dummy data)</option>
                <option value="fixture">FIXTURE (static SMPL)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="file" 
                accept="audio/mp3,audio/wav"
                id="audio-upload"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  
                  if (aiMode === 'replay') {
                    setAiState('GENERATING');
                    try {
                      const response = await fetch('http://localhost:5000/api/ai/generate?mode=replay', {
                        method: 'POST'
                      });
                      const data = await response.json();
                      if (data.success) {
                        setAiState('APPLYING_MOTION');
                        setAiMotionData(data);
                        setAiState('READY');
                      } else {
                        setAiState('ERROR');
                        alert(`Replay failed: ${data.error}`);
                      }
                    } catch (error) {
                      setAiState('ERROR');
                      alert('Error: ' + error.message);
                    }
                    return;
                  }
                  
                  if (!file) return;
                  
                  setAiState('UPLOADING');
                  const formData = new FormData();
                  formData.append('audio_file', file);
                  
                  try {
                    setAiState('GENERATING');
                    const response = await fetch('http://localhost:5000/api/ai/generate', {
                      method: 'POST',
                      body: formData
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      setAiState('APPLYING_MOTION');
                      setAiMotionData(data); // Pass to DanceStage
                      setAiState('READY');
                    } else {
                      setAiState('ERROR');
                      alert(`Generation failed: ${data.error}`);
                    }
                  } catch (error) {
                    setAiState('ERROR');
                    alert('Error connecting to backend: ' + error.message);
                  }
                }}
              />
              
              <label 
                htmlFor="audio-upload" 
                className="secondary-btn" 
                style={{ 
                  cursor: aiState === 'GENERATING' || aiState === 'UPLOADING' ? 'not-allowed' : 'pointer', 
                  padding: '8px 12px', fontSize: '14px', borderRadius: '4px', background: '#333', color: '#fff',
                  opacity: aiState === 'GENERATING' || aiState === 'UPLOADING' ? 0.5 : 1
                }}
              >
                Upload & Generate
              </label>

              <span style={{ fontSize: '12px', color: '#aaa' }}>
                {aiState === 'IDLE' && 'Waiting for audio...'}
                {aiState === 'UPLOADING' && 'Uploading music...'}
                {aiState === 'GENERATING' && 'Generating choreography...'}
                {aiState === 'APPLYING_MOTION' && 'Applying choreography...'}
                {aiState === 'READY' && 'AI choreography ready!'}
                {aiState === 'ERROR' && 'Generation failed.'}
              </span>
            </div>
          </div>
          
          <button 
            className="primary-btn teach-me-btn"
            onClick={() => setIsTeachMode(true)}
            disabled={!videoId}
            style={{ marginTop: '10px' }}
          >
            🎓 TEACH ME
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dance;

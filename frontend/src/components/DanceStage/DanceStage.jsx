import { useMemo } from 'react';
import Scene from './Scene';
import DanceTimeline from './Animation/DanceTimeline';
import './DanceStage.css';

const DanceStage = ({ playerState }) => {
  // Instantiate the timeline once per stage
  const danceTimeline = useMemo(() => {
    const timeline = new DanceTimeline();
    // For Phase 4 verification, mock a choreography sequence.
    // In Phase 5, this will be populated by AI generated motion buffers.
    timeline.loadChoreography({
      duration: 180,
      segments: [
        { start: 0, end: 180, motion: 'Action' } // Assumes the GLB has an action named 'Action'
      ]
    });
    return timeline;
  }, []);

  return (
    <div className="dance-stage">
      <div className="three-js-container" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Scene playerState={playerState} danceTimeline={danceTimeline} />
      </div>
    </div>
  );
};

export default DanceStage;

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * MusicDanceSynchronizer
 * 
 * A component/hook meant to be placed inside the Three.js <Canvas>.
 * It acts as the bridge between the external YouTube state and the internal 
 * DanceTimeline & MotionAdapter.
 */
const MusicDanceSynchronizer = ({ 
  playerState, // from useYouTubePlayer (currentTime, isPlaying, playbackRate)
  danceTimeline, 
  maleAdapter, 
  femaleAdapter 
}) => {
  const lastSyncTimeRef = useRef(0);
  const isScrubbingRef = useRef(false);

  // When playback rate changes, apply to adapters
  useEffect(() => {
    if (maleAdapter) maleAdapter.setMotionSpeed(playerState.playbackRate);
    if (femaleAdapter) femaleAdapter.setMotionSpeed(playerState.playbackRate);
  }, [playerState.playbackRate, maleAdapter, femaleAdapter]);

  useFrame((state, delta) => {
    if (!playerState || !maleAdapter || !femaleAdapter) return;

    const ytTime = playerState.currentTime;

    // Detect if the user scrubbed/seeked (a large sudden jump in time)
    // or if the video buffered (time didn't advance despite playing)
    const timeDelta = Math.abs(ytTime - lastSyncTimeRef.current);
    
    // If the difference between expected time and actual time is > 0.5s, 
    // we consider it a seek or major buffer event.
    if (timeDelta > 0.5) {
      isScrubbingRef.current = true;
    }

    if (isScrubbingRef.current) {
      // Hard reset the animation mixer to the exact YouTube time
      maleAdapter.setMotionTime(ytTime);
      femaleAdapter.setMotionTime(ytTime);
      
      // Tell the timeline to evaluate what motion should be playing at this new time
      danceTimeline.evaluate(ytTime, maleAdapter);
      danceTimeline.evaluate(ytTime, femaleAdapter);
      
      isScrubbingRef.current = false;
    } else if (playerState.isPlaying) {
      // Normal playback: advance by standard delta time for smooth blending.
      // We scale the delta by playbackRate manually since we are feeding the mixer update.
      const adjustedDelta = delta * playerState.playbackRate;
      
      maleAdapter.advanceMotion(adjustedDelta);
      femaleAdapter.advanceMotion(adjustedDelta);
      
      // Periodically check if we've crossed a choreo segment boundary
      danceTimeline.evaluate(ytTime, maleAdapter);
      danceTimeline.evaluate(ytTime, femaleAdapter);
      
      // Soft drift correction:
      // If the Three.js clock and YouTube clock drift slightly (e.g. 50ms - 200ms), 
      // we could speed up or slow down the mixer timescale imperceptibly. 
      // But for Phase 4, keeping them loosely coupled with seek-snapping is sufficient.
    }

    lastSyncTimeRef.current = ytTime;
  });

  return null; // Logic-only component
};

export default MusicDanceSynchronizer;

/**
 * DanceTimeline
 * 
 * Manages the high-level choreography. 
 * Resolves a specific point in time to a specific motion or blending state.
 */
class DanceTimeline {
  constructor() {
    this.segments = [];
    this.currentMotion = null;
  }

  /**
   * Load a choreography sequence (currently named clips, later generated buffers)
   */
  loadChoreography(sequence) {
    this.segments = sequence.segments || [];
  }

  /**
   * Evaluates the timeline at a given time and instructs the MotionAdapter
   * what to play.
   */
  evaluate(timeInSeconds, motionAdapter) {
    if (!this.segments.length || !motionAdapter) return;

    // Find the active segment for the current time
    const activeSegment = this.segments.find(
      seg => timeInSeconds >= seg.start && timeInSeconds < seg.end
    );

    if (activeSegment) {
      if (this.currentMotion !== activeSegment.motion) {
        // We've crossed a segment boundary, trigger a crossfade
        motionAdapter.playMotion(activeSegment.motion, 0.5);
        this.currentMotion = activeSegment.motion;
      }
    }
  }
}

export default DanceTimeline;

import * as THREE from 'three';

/**
 * MotionAdapter
 * 
 * Conceptually separates the underlying 3D representation (AnimationMixer, 
 * GLB clips) from the choreographic instructions (what to play, when to blend).
 * 
 * Future AI implementations will inject motion buffers here instead of 
 * just playing named clips.
 */
class MotionAdapter {
  constructor(mixer, predefinedActions = {}) {
    this.mixer = mixer;
    this.actions = predefinedActions;
    this.currentAction = null;
    this.isPlaying = false;
    
    // We do NOT start the mixer's internal clock automatically.
    // The MusicDanceSynchronizer will manually advance this.mixer.setTime() 
    // to strictly enforce synchronization with YouTube.
  }

  playMotion(motionName, fadeDuration = 0.5) {
    const nextAction = this.actions[motionName];
    if (!nextAction) {
      console.warn(`[MotionAdapter] Motion '${motionName}' not found.`);
      return;
    }

    if (this.currentAction) {
      nextAction.reset().play();
      nextAction.crossFadeFrom(this.currentAction, fadeDuration, true);
    } else {
      nextAction.reset().play();
    }

    this.currentAction = nextAction;
    this.isPlaying = true;
  }

  pauseMotion() {
    this.isPlaying = false;
  }

  resumeMotion() {
    this.isPlaying = true;
  }

  setMotionSpeed(speed) {
    this.mixer.timeScale = speed;
  }

  /**
   * Directly sets the absolute time of the animation mixer.
   * This is called by the Synchronizer to snap the animation to a specific frame.
   */
  setMotionTime(absoluteTimeInSeconds) {
    this.mixer.setTime(absoluteTimeInSeconds);
  }

  /**
   * Advances the animation mixer by a delta.
   * Used during normal playback to avoid hard resets while maintaining smooth blending.
   */
  advanceMotion(deltaSeconds) {
    if (this.isPlaying) {
      this.mixer.update(deltaSeconds);
    }
  }

  stopMotion() {
    this.mixer.stopAllAction();
    this.currentAction = null;
    this.isPlaying = false;
  }
}

export default MotionAdapter;

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
    
    // Default values, can be overridden when motion is loaded
    this.fps = 60; 
    this.numFrames = Infinity;
    this.duration = Infinity;

    // We do NOT start the mixer's internal clock automatically.
    // The MusicDanceSynchronizer will manually advance this.mixer.setTime() 
    // to strictly enforce synchronization with YouTube.
  }

  setMotionMetadata(fps, numFrames, duration) {
    this.fps = fps;
    this.numFrames = numFrames;
    this.duration = duration;
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
    if (this.fps && this.numFrames) {
      const frameIndex = Math.min(Math.floor(absoluteTimeInSeconds * this.fps), this.numFrames - 1);
      const quantizedTime = frameIndex / this.fps;
      this.mixer.setTime(quantizedTime);
    } else {
      this.mixer.setTime(absoluteTimeInSeconds);
    }
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

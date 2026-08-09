import * as THREE from 'three';
import { createEmptyMotion } from './NormalizedMotion';

/**
 * Generates a simple known motion for testing retargeting without AI.
 * Motion: 
 * - Hips sway side to side
 * - Left arm raises
 * - Right arm raises
 */
export const generateMockMotion = () => {
  const duration = 10; // seconds
  const fps = 30;
  const numFrames = duration * fps;
  
  const motion = createEmptyMotion(duration, fps);
  motion.skeleton.joints = ['root', 'leftArm', 'rightArm', 'leftUpLeg', 'rightUpLeg'];

  for (let i = 0; i < numFrames; i++) {
    const time = i / fps;
    const progress = time / duration;
    
    // Sine wave for oscillatory motion
    const wave = Math.sin(time * Math.PI * 2); // 1 cycle per second
    const slowWave = Math.sin(time * Math.PI); // 0.5 cycles per second

    // Root (Hips) sways side to side (X axis translation)
    const rootX = wave * 0.1;
    // Root dips down slightly (Y axis translation)
    const rootY = -Math.abs(wave) * 0.05;

    // Hip rotation (yaw)
    const rootQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, slowWave * 0.2, 0)
    );

    // Left Arm raises up (Z/X axis depending on rest pose)
    // Assuming T-Pose where arm points along X, raising it implies Z rotation
    const leftArmQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, 0, Math.abs(slowWave) * 1.5)
    );

    // Right Arm raises up
    const rightArmQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, 0, -Math.abs(slowWave) * 1.5)
    );
    
    // Knee bend / leg rotation (raise legs slightly)
    const leftUpLegQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.max(0, wave) * 0.5, 0, 0)
    );

    motion.frames.push({
      time,
      rootPosition: [rootX, rootY, 0],
      joints: {
        root: [rootQuat.x, rootQuat.y, rootQuat.z, rootQuat.w],
        leftArm: [leftArmQuat.x, leftArmQuat.y, leftArmQuat.z, leftArmQuat.w],
        rightArm: [rightArmQuat.x, rightArmQuat.y, rightArmQuat.z, rightArmQuat.w],
        leftUpLeg: [leftUpLegQuat.x, leftUpLegQuat.y, leftUpLegQuat.z, leftUpLegQuat.w]
      }
    });
  }

  return motion;
};

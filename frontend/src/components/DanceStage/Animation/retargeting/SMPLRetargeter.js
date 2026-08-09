import * as THREE from 'three';
import { createEmptyMotion } from './NormalizedMotion';

/**
 * SMPLRetargeter
 * 
 * Responsibilities:
 * - Accept raw mint-main output (smpl_poses: [frames, 24, 3], smpl_trans: [frames, 3])
 * - Map SMPL joint indices (0-23) to normalized humanoid names
 * - Convert Axis-Angle rotations to THREE.Quaternion
 * - Output NormalizedMotion JSON format
 */
export class SMPLRetargeter {
  static SMPL_TO_NORMALIZED = {
    0: 'hips', // Pelvis
    1: 'leftUpperLeg', // L_Hip
    2: 'rightUpperLeg', // R_Hip
    3: 'spine', // Spine1
    4: 'leftLowerLeg', // L_Knee
    5: 'rightLowerLeg', // R_Knee
    6: 'spine1', // Spine2
    7: 'leftFoot', // L_Ankle
    8: 'rightFoot', // R_Ankle
    9: 'spine2', // Spine3
    10: 'leftToeBase', // L_Foot
    11: 'rightToeBase', // R_Foot
    12: 'neck', // Neck
    13: 'leftShoulder', // L_Collar
    14: 'rightShoulder', // R_Collar
    15: 'head', // Head
    16: 'leftArm', // L_Shoulder
    17: 'rightArm', // R_Shoulder
    18: 'leftForeArm', // L_Elbow
    19: 'rightForeArm', // R_Elbow
    20: 'leftHand', // L_Wrist
    21: 'rightHand' // R_Wrist
    // 22: L_Hand, 23: R_Hand (Ignored)
  };

  /**
   * Converts SMPL output to NormalizedMotion format
   * @param {Array} smplPoses - 3D array [frames][24][3] (Axis-Angle)
   * @param {Array} smplTrans - 2D array [frames][3] (Global translation)
   * @param {Number} fps - Frames per second (default 30)
   */
  static convert(smplPoses, smplTrans, fps = 30) {
    const numFrames = smplPoses.length;
    const duration = numFrames / fps;
    const motion = createEmptyMotion(duration, fps);
    
    // Register the mapped joints
    motion.skeleton.joints = Object.values(this.SMPL_TO_NORMALIZED);

    for (let frameIdx = 0; frameIdx < numFrames; frameIdx++) {
      const framePoses = smplPoses[frameIdx]; // [24][3]
      const frameTrans = smplTrans ? smplTrans[frameIdx] : [0, 0, 0]; // [3]
      const time = frameIdx / fps;

      const frameData = {
        time,
        // We might need coordinate conversion here later (Phase C)
        rootPosition: [frameTrans[0], frameTrans[1], frameTrans[2]],
        joints: {}
      };

      for (let jointIdx = 0; jointIdx < 24; jointIdx++) {
        const normalizedName = this.SMPL_TO_NORMALIZED[jointIdx];
        if (!normalizedName) continue; // Skip unmapped joints

        const axisAngle = framePoses[jointIdx]; // [rx, ry, rz]
        const rx = axisAngle[0];
        const ry = axisAngle[1];
        const rz = axisAngle[2];

        // The length of the vector is the angle in radians
        const angle = Math.sqrt(rx * rx + ry * ry + rz * rz);
        const quat = new THREE.Quaternion();

        if (angle > 1e-6) {
          // Normalize the axis
          const axis = new THREE.Vector3(rx / angle, ry / angle, rz / angle);
          quat.setFromAxisAngle(axis, angle);
        } // Else stays identity [0,0,0,1]

        frameData.joints[normalizedName] = [quat.x, quat.y, quat.z, quat.w];
      }

      motion.frames.push(frameData);
    }

    return motion;
  }
}

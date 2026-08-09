import * as THREE from 'three';
import { humanoidBoneMap } from './humanoidBoneMap';

export class HumanoidRetargeter {
  constructor(avatarGroup) {
    this.avatar = avatarGroup;
    this.boneMap = new Map(); // normalizedName -> actual THREE.Bone
    this.restPoses = new Map(); // THREE.Bone.uuid -> THREE.Quaternion (rest rotation)
    
    this.inspectSkeleton();
  }

  inspectSkeleton() {
    console.log('[HumanoidRetargeter] Inspecting avatar skeleton...');
    
    // 1. Gather all bones
    const allBones = [];
    this.avatar.traverse((child) => {
      if (child.isBone) {
        allBones.push(child);
        // Save rest pose
        this.restPoses.set(child.uuid, child.quaternion.clone());
      }
    });

    console.log(`[HumanoidRetargeter] Found ${allBones.length} bones in avatar.`);

    // 2. Resolve mapped bones
    for (const [normalizedName, possibleNames] of Object.entries(humanoidBoneMap)) {
      let foundBone = null;
      for (const possibleName of possibleNames) {
        foundBone = allBones.find(b => b.name === possibleName);
        if (foundBone) break;
      }

      if (foundBone) {
        this.boneMap.set(normalizedName, foundBone);
      } else {
        console.warn(`[HumanoidRetargeter] Missing optional bone mapping for: ${normalizedName}`);
      }
    }
  }

  getBoneNames() {
    const names = [];
    this.avatar.traverse(child => {
      if (child.isBone) {
        // Find if mapped
        let mappedTo = null;
        for (const [norm, bone] of this.boneMap.entries()) {
          if (bone.uuid === child.uuid) {
            mappedTo = norm;
            break;
          }
        }
        names.push({
          name: child.name,
          parent: child.parent ? child.parent.name : null,
          mappedTo
        });
      }
    });
    return names;
  }

  /**
   * Converts a NormalizedMotion object into a THREE.AnimationClip
   */
  createAnimationClip(normalizedMotion, clipName = "AI_Dance") {
    const tracks = [];
    const times = normalizedMotion.frames.map(f => f.time);

    // 1. Handle Root Translation (Position)
    if (this.boneMap.has('hips')) {
      const rootBone = this.boneMap.get('hips');
      const positions = [];
      
      // Get the rest position of the root to add offset
      const restPos = rootBone.position.clone();

      normalizedMotion.frames.forEach(frame => {
        if (frame.rootPosition) {
          // Add generated offset to rest position
          positions.push(
            restPos.x + frame.rootPosition[0],
            restPos.y + frame.rootPosition[1],
            restPos.z + frame.rootPosition[2]
          );
        } else {
          positions.push(restPos.x, restPos.y, restPos.z);
        }
      });

      if (positions.length > 0) {
        const trackName = `${rootBone.name}.position`;
        tracks.push(new THREE.VectorKeyframeTrack(trackName, times, positions));
      }
    }

    // 2. Handle Joint Rotations
    for (const normalizedName of Object.keys(humanoidBoneMap)) {
      if (!this.boneMap.has(normalizedName)) continue;
      
      const bone = this.boneMap.get(normalizedName);
      const restQuat = this.restPoses.get(bone.uuid);
      const quaternions = [];
      let hasData = false;

      normalizedMotion.frames.forEach(frame => {
        const jointQuatArray = frame.joints[normalizedName];
        if (jointQuatArray) {
          hasData = true;
          // The normalized motion is an offset quaternion
          const offsetQuat = new THREE.Quaternion().fromArray(jointQuatArray);
          
          // Apply rest-pose correction: final = rest * offset
          // (assuming offset is in local space relative to the rest pose)
          const finalQuat = restQuat.clone().multiply(offsetQuat).normalize();
          
          quaternions.push(finalQuat.x, finalQuat.y, finalQuat.z, finalQuat.w);
        } else {
          // If no data for this joint, hold rest pose
          quaternions.push(restQuat.x, restQuat.y, restQuat.z, restQuat.w);
        }
      });

      if (hasData) {
        const trackName = `${bone.name}.quaternion`;
        tracks.push(new THREE.QuaternionKeyframeTrack(trackName, times, quaternions));
      }
    }

    return new THREE.AnimationClip(clipName, normalizedMotion.duration, tracks);
  }
}

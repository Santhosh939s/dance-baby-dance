import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import MotionAdapter from './Animation/MotionAdapter';

/**
 * AvatarController
 * 
 * Responsible for loading the 3D humanoid GLB, managing its skeleton,
 * and passing the AnimationMixer to the MotionAdapter.
 */
const AvatarController = ({ type, isPlaying, onAdapterReady }) => {
  const group = useRef();
  
  // NOTE: Phase 4 expects placeholder assets to be placed here.
  // E.g. /dance-assets/avatars/male/male.glb
  const modelPath = `/dance-assets/avatars/${type}/${type}.glb`;
  
  // Load the GLTF. If it doesn't exist, useGLTF will throw and Suspense will catch it.
  // We wrap in a try-catch pattern at a higher level, but for now we assume the user places the file.
  const { scene, animations } = useGLTF(modelPath);
  
  // Extract animations from the loaded model
  const { actions, mixer } = useAnimations(animations, group);
  
  // Initialize the MotionAdapter
  const adapterRef = useRef(null);

  useEffect(() => {
    if (mixer && !adapterRef.current) {
      // Create a MotionAdapter instance for this specific avatar's mixer
      adapterRef.current = new MotionAdapter(mixer, actions);
      
      if (onAdapterReady) {
        onAdapterReady(adapterRef.current);
      }
      
      // For Phase 4 verification, play a predefined animation if available
      // The adapter abstracts away whether this is a predefined clip or generated motion
      if (actions) {
        const actionNames = Object.keys(actions);
        if (actionNames.length > 0) {
          adapterRef.current.playMotion(actionNames[0]);
        }
      }
    }
  }, [mixer, actions, onAdapterReady]);

  // Synchronize playback state
  useEffect(() => {
    if (adapterRef.current) {
      if (isPlaying) {
        adapterRef.current.resumeMotion();
      } else {
        adapterRef.current.pauseMotion();
      }
    }
  }, [isPlaying]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
};

// Preload to avoid hiccups
// We comment this out because if the files don't exist yet, it'll crash the dev server startup loop
// useGLTF.preload('/dance-assets/avatars/male/male.glb');
// useGLTF.preload('/dance-assets/avatars/female/female.glb');

export default AvatarController;

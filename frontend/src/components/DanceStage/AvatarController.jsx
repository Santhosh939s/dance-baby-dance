import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import MotionAdapter from './Animation/MotionAdapter';
import { HumanoidRetargeter } from './Animation/retargeting/HumanoidRetargeter';
import { generateMockMotion } from './Animation/retargeting/MockMotionProvider';
import { SMPLRetargeter } from './Animation/retargeting/SMPLRetargeter';
import { StaticSMPLFixture } from './Animation/retargeting/StaticSMPLFixture';
import AvatarSkeletonInspector from './AvatarSkeletonInspector';
import { Html } from '@react-three/drei';
/**
 * AvatarController is responsible for loading the 3D model, binding animations,
 * and passing the AnimationMixer to the MotionAdapter.
 */
const AvatarController = ({ type, isPlaying, onAdapterReady, normalizedMotion }) => {
  const group = useRef();
  
  const modelPath = `/dance-assets/avatars/${type}/${type}.glb`;
  
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, group);
  
  const adapterRef = useRef(null);
  const retargeterRef = useRef(null);
  const [boneData, setBoneData] = useState([]);

  useEffect(() => {
    if (scene && !retargeterRef.current) {
      const retargeter = new HumanoidRetargeter(scene);
      retargeterRef.current = retargeter;
      setBoneData(retargeter.getBoneNames());
    }
  }, [scene]);

  useEffect(() => {
    if (mixer && !adapterRef.current && retargeterRef.current && normalizedMotion) {
      adapterRef.current = new MotionAdapter(mixer, {});
      
      if (onAdapterReady) {
        onAdapterReady(adapterRef.current);
      }
      
      // Retarget to THREE.AnimationClip
      const clip = retargeterRef.current.createAnimationClip(normalizedMotion, 'AI_Dance');
      const action = mixer.clipAction(clip);
      
      adapterRef.current.setMotionMetadata(normalizedMotion.fps, normalizedMotion.frames.length, normalizedMotion.duration);
      
      adapterRef.current.actions['AI_Dance'] = action;
      adapterRef.current.playMotion('AI_Dance');
    }
  }, [mixer, onAdapterReady, normalizedMotion]); 

  // Synchronize playback state
  useEffect(() => {
    if (adapterRef.current) {
      if (isPlaying) {
        adapterRef.current.playMotion();
      } else {
        adapterRef.current.pauseMotion();
      }
    }
  }, [isPlaying]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
      
      {/* Development Skeleton Inspector UI (Rendered as HTML overlay) */}
      <Html position={type === 'male' ? [-1, 2, 0] : [1, 2, 0]} center zIndexRange={[100, 0]}>
        <div className={`skeleton-inspector-container ${type}`}>
          <AvatarSkeletonInspector boneData={boneData} avatarName={type} />
        </div>
      </Html>
    </group>
  );
};

export default AvatarController;

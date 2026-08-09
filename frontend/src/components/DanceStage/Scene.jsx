import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import AvatarController from './AvatarController';
import MusicDanceSynchronizer from './synchronization/MusicDanceSynchronizer';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { SMPLRetargeter } from './Animation/retargeting/SMPLRetargeter';
import { generateMockMotion } from './Animation/retargeting/MockMotionProvider';
import { StaticSMPLFixture } from './Animation/retargeting/StaticSMPLFixture';

const Scene = ({ playerState, danceTimeline, aiMotionData, aiMode }) => {
  const [maleAdapter, setMaleAdapter] = useState(null);
  const [femaleAdapter, setFemaleAdapter] = useState(null);

  const normalizedMotion = useMemo(() => {
    if (aiMode === 'mock') {
      return generateMockMotion();
    } else if (aiMode === 'fixture') {
      return SMPLRetargeter.convert(
        StaticSMPLFixture.smplPoses,
        StaticSMPLFixture.smplTrans,
        StaticSMPLFixture.fps
      );
    } else if ((aiMode === 'mint' || aiMode === 'replay') && aiMotionData) {
      return SMPLRetargeter.convert(
        aiMotionData.motion.poses,
        aiMotionData.motion.trans,
        aiMotionData.fps
      );
    }
    return null;
  }, [aiMode, aiMotionData]);

  return (
    <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={1024}
      />
      
      <Environment preset="city" />
      
      <MusicDanceSynchronizer 
        playerState={playerState}
        danceTimeline={danceTimeline}
        maleAdapter={maleAdapter}
        femaleAdapter={femaleAdapter}
      />

      <Suspense fallback={null}>
        {/* Placeholder: Two Avatars side by side */}
        <group position={[-1, 0, 0]}>
          <AvatarController 
            type="male" 
            isPlaying={playerState?.isPlaying} 
            onAdapterReady={setMaleAdapter}
            normalizedMotion={normalizedMotion}
          />
        </group>
        <group position={[1, 0, 0]}>
          <AvatarController 
            type="female" 
            isPlaying={playerState?.isPlaying} 
            onAdapterReady={setFemaleAdapter}
            normalizedMotion={normalizedMotion}
          />
        </group>
      </Suspense>

      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2} 
        far={4} 
      />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2 + 0.1} 
      />
    </Canvas>
  );
};

export default Scene;

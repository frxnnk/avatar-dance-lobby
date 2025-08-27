'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar from '@/components/Avatar';
import SceneEnv from '@/components/SceneEnv';
import SimpleDanceFloor from '@/components/SimpleDanceFloor';
import DanceController from '@/components/DanceController';
import PartyStage from '@/components/PartyStage';
import { AnimationName, ANIMATION_NAMES } from '@/lib/animLoader';

interface ElementPosition {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  scale: number;
}

interface CameraPosition {
  x: number;
  y: number;
  z: number;
  fov: number;
}

interface LightingPreset {
  name: string;
  keyLightIntensity: number;
  keyLightColor: string;
  topLightIntensity: number;
  topLightColor: string;
  ambientIntensity: number;
  ambientColor: string;
  rimLight1Intensity: number;
  rimLight1Color: string;
  rimLight2Intensity: number;
  rimLight2Color: string;
  environmentIntensity: number;
  bloomIntensity: number;
}

export default function Home() {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationName>(ANIMATION_NAMES.ALL_NIGHT_DANCE);
  const [characterScene, setCharacterScene] = useState<any>(null);
  const [stagePositions, setStagePositions] = useState<Record<string, ElementPosition>>({});
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  // Camera position (adjustable again)
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    x: 0.00, y: 1.60, z: 8.00, fov: 35
  });
  
  // Lighting preset
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>({
    name: "Club Default",
    keyLightIntensity: 2.0,
    keyLightColor: "#ffffff",
    topLightIntensity: 1.0,
    topLightColor: "#f0f0f0",
    ambientIntensity: 0.1,
    ambientColor: "#404080",
    rimLight1Intensity: 0.8,
    rimLight1Color: "#ff1493",
    rimLight2Intensity: 0.6,
    rimLight2Color: "#00ced1",
    environmentIntensity: 0.3,
    bloomIntensity: 1.5
  });

  const handleAnimationChange = (animation: AnimationName) => {
    setCurrentAnimation(animation);
  };

  const handleSceneLoad = (scene: any) => {
    setCharacterScene(scene);
  };

  const handleStagePositionUpdate = (element: string, position: ElementPosition) => {
    setStagePositions(prev => ({ ...prev, [element]: position }));
  };

  const handleCameraUpdate = (position: CameraPosition) => {
    setCameraPosition(position);
  };

  const handleLightingUpdate = (preset: LightingPreset) => {
    setLightingPreset(preset);
  };


  return (
    <main className="h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas 
        camera={{ 
          position: [cameraPosition.x, cameraPosition.y, cameraPosition.z], 
          fov: cameraPosition.fov 
        }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Environment and Lighting */}
          <SceneEnv enableBloom={true} lightingPreset={lightingPreset} />
          
          {/* Simple infinite dance floor */}
          <SimpleDanceFloor />
          
          {/* Party Stage Elements */}
          <PartyStage positions={stagePositions} isMusicPlaying={isMusicPlaying} />
          
          {/* Avatar */}
          <Avatar 
            currentAnimation={currentAnimation}
            onAnimationChange={handleAnimationChange}
            onSceneLoad={handleSceneLoad}
          />
        </Suspense>
        
        {/* Camera Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          maxDistance={25}
          minDistance={1}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>


      {/* Professional Dance Controller */}
      <DanceController 
        currentAnimation={currentAnimation}
        onAnimationChange={handleAnimationChange}
        onMusicStateChange={setIsMusicPlaying}
      />

      {/* Character positioning finalized */}
      
    </main>
  );
}
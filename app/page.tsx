'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar from '@/components/Avatar';
import SceneEnv from '@/components/SceneEnv';
import SimpleDanceFloor from '@/components/SimpleDanceFloor';
import DanceController from '@/components/DanceController';
import PartyStage, { SpeakerConfig } from '@/components/PartyStage';
// import SizeControls, { SizeSettings } from '@/components/SizeControls';
import type { ConfigState } from '@/components/PositionControls';
// import PositionControls from '@/components/PositionControls';
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

interface SizeSettings {
  danceFloor: {
    gridSize: number;
    squareSize: number;
    spacing: number;
  };
  objects: {
    discoBallScale: number;
    speakerScale: number;
  };
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
  const [currentAnimation, setCurrentAnimation] = useState<AnimationName>(ANIMATION_NAMES.IDLE_4);
  const [characterScene, setCharacterScene] = useState<any>(null);
  const [stagePositions, setStagePositions] = useState<Record<string, ElementPosition>>({});
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  // Camera position (adjustable again)
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    x: 0.00, y: 1.60, z: 8.00, fov: 35
  });
  
  // Scene configuration
  const [sceneConfig, setSceneConfig] = useState<ConfigState>({
    discoBall: { x: 0.00, y: 2.40, z: -2.00, rotationY: 0.000, scale: 0.60 },
    speakers: [
      { id: 'speaker1', position: { x: -3.0, y: -0.10, z: -6.80, rotationY: 0.5, scale: 0.50 }, enabled: true },
      { id: 'speaker2', position: { x: 3.0, y: -0.10, z: -6.80, rotationY: -0.5, scale: 0.50 }, enabled: true },
      { id: 'speaker3', position: { x: -4.5, y: -0.10, z: 0, rotationY: 1.57, scale: 0.40 }, enabled: false },
      { id: 'speaker4', position: { x: 4.5, y: -0.10, z: 0, rotationY: -1.57, scale: 0.40 }, enabled: false }
    ],
    danceFloor: { gridSize: 20, squareSize: 0.5, spacing: 0.05 }
  });

  // Size settings (kept for backward compatibility)
  const sizeSettings: SizeSettings = {
    danceFloor: sceneConfig.danceFloor,
    objects: {
      discoBallScale: sceneConfig.discoBall.scale,
      speakerScale: 0.5 // Default speaker scale
    }
  };
  
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

  const handleConfigChange = (config: ConfigState) => {
    setSceneConfig(config);
  };

  const handleSaveConfiguration = (config: ConfigState) => {
    // Here you can implement saving to localStorage or sending to backend
    localStorage.setItem('avatarSceneConfig', JSON.stringify(config));
    console.log('🎉 Configuración guardada exitosamente!', config);
    
    // Show a success message (you can enhance this with a toast notification)
    alert('✅ Configuración guardada exitosamente! Esta será la configuración por defecto.');
  };

  const handleMusicPlayStateChange = (isPlaying: boolean) => {
    setIsMusicPlaying(isPlaying);
  };


  // Load saved configuration on mount
  const loadSavedConfiguration = () => {
    try {
      const saved = localStorage.getItem('avatarSceneConfig');
      if (saved) {
        const config = JSON.parse(saved) as ConfigState;
        setSceneConfig(config);
        console.log('📁 Configuración cargada desde almacenamiento local');
      }
    } catch (error) {
      console.error('❌ Error cargando configuración guardada:', error);
    }
  };

  // Load configuration on component mount
  React.useEffect(() => {
    loadSavedConfiguration();
    
    // Load SoundCloud Widget API
    if (!document.getElementById('soundcloud-widget-api')) {
      const script = document.createElement('script');
      script.id = 'soundcloud-widget-api';
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);


  return (
    <>
      {/* Hide SoundCloud overlays */}
      <style jsx global>{`
        iframe[src*="soundcloud"] {
          pointer-events: auto;
        }
        /* Try to hide the listen in browser overlay */
        .sc-border-light-top,
        .listenEngagement__wrapper,
        .sc-text-light,
        .playButton__wrapper,
        .sc-link-light {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>
      
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
          <SimpleDanceFloor 
            gridSize={sceneConfig.danceFloor.gridSize}
            squareSize={sceneConfig.danceFloor.squareSize}
            spacing={sceneConfig.danceFloor.spacing}
          />
          
          {/* Party Stage Elements */}
          <PartyStage 
            positions={{ discoBall: sceneConfig.discoBall }} 
            isMusicPlaying={isMusicPlaying}
            objectSizes={sizeSettings.objects}
            speakers={sceneConfig.speakers}
          />
          
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
          maxAzimuthAngle={0}
          minAzimuthAngle={0}
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

      {/* Position Controls - Removed for cleaner interface */}
      {/* <PositionControls 
        config={sceneConfig}
        onConfigChange={handleConfigChange}
        onSaveConfiguration={handleSaveConfiguration}
      /> */}


      {/* Character positioning finalized */}
      
      </main>
    </>
  );
}
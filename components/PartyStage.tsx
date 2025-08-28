'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ElementPosition {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  scale: number;
}

interface SpeakerConfig {
  id: string;
  position: ElementPosition;
  enabled: boolean;
}

interface PartyStageProps {
  positions?: Record<string, ElementPosition>;
  isMusicPlaying?: boolean;
  objectSizes?: {
    discoBallScale?: number;
    speakerScale?: number;
  };
  speakers?: SpeakerConfig[];
}

export default function PartyStage({ positions, isMusicPlaying = false, objectSizes, speakers }: PartyStageProps) {
  const discoballRef = useRef<THREE.Group>(null);
  const speakerRefs = useRef<Record<string, THREE.Group>>({});
  
  // Default positions
  const defaultPositions: Record<string, ElementPosition> = {
    discoBall: { x: 0.00, y: 2.40, z: -2.00, rotationY: 0.000, scale: 0.60 }
  };

  // Default speakers configuration
  const defaultSpeakers: SpeakerConfig[] = [
    { 
      id: 'speaker1', 
      position: { x: -3.0, y: -0.10, z: -6.80, rotationY: 0.5, scale: 0.50 }, 
      enabled: true 
    },
    { 
      id: 'speaker2', 
      position: { x: 3.0, y: -0.10, z: -6.80, rotationY: -0.5, scale: 0.50 }, 
      enabled: true 
    },
    { 
      id: 'speaker3', 
      position: { x: -4.5, y: -0.10, z: 0, rotationY: 1.57, scale: 0.40 }, 
      enabled: false 
    },
    { 
      id: 'speaker4', 
      position: { x: 4.5, y: -0.10, z: 0, rotationY: -1.57, scale: 0.40 }, 
      enabled: false 
    }
  ];

  const currentSpeakers = speakers || defaultSpeakers;
  
  // Merge positions with defaults to ensure all properties exist
  const currentPositions = {
    ...defaultPositions,
    ...positions
  };
  
  // Load stage elements
  const { scene: discoBall } = useGLTF('/stages/party/disco-ball-with-colored-lights/source/disco-ball.glb');
  const { scene: speakerModel } = useGLTF('/stages/party/technival-speakers-wall/source/speaker2.glb');

  // Animate disco ball rotation and speaker vibration
  useFrame((state) => {
    if (discoballRef.current) {
      discoballRef.current.rotation.y += 0.01;
    }
    
    // Subtle speaker vibration when music is playing
    if (isMusicPlaying) {
      const time = state.clock.getElapsedTime();
      const intensity = 0.005; // Much more subtle vibration
      const frequency = 12; // Higher frequency for more realistic bass response
      
      currentSpeakers.forEach((speakerConfig) => {
        if (speakerConfig.enabled && speakerRefs.current[speakerConfig.id]) {
          const speakerRef = speakerRefs.current[speakerConfig.id];
          const basePos = speakerConfig.position;
          
          // Different frequencies for each speaker to create variety
          const offset = speakerConfig.id === 'speaker1' ? 0 : 
                        speakerConfig.id === 'speaker2' ? Math.PI / 4 : 
                        speakerConfig.id === 'speaker3' ? Math.PI / 2 : Math.PI;
          
          // Very subtle position vibration - mostly Y axis (up/down)
          speakerRef.position.y = basePos.y + Math.sin((time + offset) * frequency) * intensity;
          // Minimal X/Z movement
          speakerRef.position.x = basePos.x + Math.sin((time + offset) * frequency * 0.8) * intensity * 0.3;
          speakerRef.position.z = basePos.z + Math.cos((time + offset) * frequency * 0.6) * intensity * 0.2;
          
          // No scale changes - keep original size
          const currentScale = objectSizes?.speakerScale || basePos.scale;
          speakerRef.scale.setScalar(currentScale);
        }
      });
    } else {
      // Return speakers to original positions when music stops
      currentSpeakers.forEach((speakerConfig) => {
        if (speakerConfig.enabled && speakerRefs.current[speakerConfig.id]) {
          const speakerRef = speakerRefs.current[speakerConfig.id];
          const basePos = speakerConfig.position;
          
          speakerRef.position.x = basePos.x;
          speakerRef.position.y = basePos.y;
          speakerRef.position.z = basePos.z;
          const currentScale = objectSizes?.speakerScale || basePos.scale;
          speakerRef.scale.setScalar(currentScale);
        }
      });
    }
  });

  const pos = currentPositions;

  return (
    <>
      {/* Disco Ball */}
      <group 
        ref={discoballRef} 
        position={[pos.discoBall.x, pos.discoBall.y, pos.discoBall.z]} 
        scale={[
          (objectSizes?.discoBallScale || pos.discoBall.scale), 
          (objectSizes?.discoBallScale || pos.discoBall.scale), 
          (objectSizes?.discoBallScale || pos.discoBall.scale)
        ]}
      >
        <primitive object={discoBall.clone()} />
      </group>

      {/* Multiple Speakers */}
      {currentSpeakers.map((speakerConfig) => (
        speakerConfig.enabled ? (
          <group 
            key={speakerConfig.id}
            ref={(ref) => {
              if (ref) speakerRefs.current[speakerConfig.id] = ref;
            }}
            position={[
              speakerConfig.position.x, 
              speakerConfig.position.y, 
              speakerConfig.position.z
            ]} 
            scale={[
              (objectSizes?.speakerScale || speakerConfig.position.scale), 
              (objectSizes?.speakerScale || speakerConfig.position.scale), 
              (objectSizes?.speakerScale || speakerConfig.position.scale)
            ]} 
            rotation={[0, speakerConfig.position.rotationY, 0]}
          >
            <primitive object={speakerModel.clone()} />
          </group>
        ) : null
      ))}
    </>
  );
}

// Preload models for better performance
useGLTF.preload('/stages/party/disco-ball-with-colored-lights/source/disco-ball.glb');  
useGLTF.preload('/stages/party/technival-speakers-wall/source/speaker2.glb');

export type { SpeakerConfig, ElementPosition };
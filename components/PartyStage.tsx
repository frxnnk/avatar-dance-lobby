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

interface PartyStageProps {
  positions?: Record<string, ElementPosition>;
  isMusicPlaying?: boolean;
}

export default function PartyStage({ positions, isMusicPlaying = false }: PartyStageProps) {
  const discoballRef = useRef<THREE.Group>(null);
  const leftSpeakerRef = useRef<THREE.Group>(null);
  
  // Default positions
  const defaultPositions: Record<string, ElementPosition> = {
    discoBall: { x: 0.00, y: 2.40, z: -2.00, rotationY: 0.000, scale: 0.60 },
    leftSpeaker: { x: -0.50, y: -0.10, z: -6.80, rotationY: -0.042, scale: 0.50 }
  };
  
  // Merge positions with defaults to ensure all properties exist
  const currentPositions = {
    ...defaultPositions,
    ...positions
  };
  
  // Load stage elements
  const { scene: discoBall } = useGLTF('/stages/party/disco-ball-with-colored-lights/source/disco-ball.glb');
  const { scene: speakers } = useGLTF('/stages/party/technival-speakers-wall/source/speaker2.glb');

  // Animate disco ball rotation and speaker vibration
  useFrame((state) => {
    if (discoballRef.current) {
      discoballRef.current.rotation.y += 0.01;
    }
    
    // Speaker vibration when music is playing
    if (leftSpeakerRef.current && isMusicPlaying) {
      const time = state.clock.getElapsedTime();
      const intensity = 0.02; // Vibration intensity
      const frequency = 8; // Vibration frequency
      
      // Add vibration to speaker
      leftSpeakerRef.current.position.x = currentPositions.leftSpeaker.x + Math.sin(time * frequency) * intensity;
      leftSpeakerRef.current.position.z = currentPositions.leftSpeaker.z + Math.cos(time * frequency * 0.7) * intensity * 0.5;
      
      // Slight scale pulsing
      const scalePulse = 1 + Math.sin(time * frequency * 1.2) * 0.03;
      leftSpeakerRef.current.scale.setScalar(currentPositions.leftSpeaker.scale * scalePulse);
    } else if (leftSpeakerRef.current) {
      // Return to original position when music stops
      leftSpeakerRef.current.position.x = currentPositions.leftSpeaker.x;
      leftSpeakerRef.current.position.z = currentPositions.leftSpeaker.z;
      leftSpeakerRef.current.scale.setScalar(currentPositions.leftSpeaker.scale);
    }
  });

  const pos = currentPositions;

  return (
    <>
      {/* Disco Ball */}
      <group 
        ref={discoballRef} 
        position={[pos.discoBall.x, pos.discoBall.y, pos.discoBall.z]} 
        scale={[pos.discoBall.scale, pos.discoBall.scale, pos.discoBall.scale]}
      >
        <primitive object={discoBall.clone()} />
      </group>

      {/* Left Speaker */}
      <group 
        ref={leftSpeakerRef}
        position={[pos.leftSpeaker.x, pos.leftSpeaker.y, pos.leftSpeaker.z]} 
        scale={[pos.leftSpeaker.scale, pos.leftSpeaker.scale, pos.leftSpeaker.scale]} 
        rotation={[0, pos.leftSpeaker.rotationY, 0]}
      >
        <primitive object={speakers.clone()} />
      </group>
    </>
  );
}

// Preload models for better performance
useGLTF.preload('/stages/party/disco-ball-with-colored-lights/source/disco-ball.glb');  
useGLTF.preload('/stages/party/technival-speakers-wall/source/speaker2.glb');
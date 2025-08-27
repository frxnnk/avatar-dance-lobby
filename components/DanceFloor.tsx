'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function DanceFloor() {
  const groupRef = useRef<THREE.Group>(null);
  const [lightObjects, setLightObjects] = useState<THREE.Mesh[]>([]);
  const { scene } = useGLTF('/stages/animated-dance-floor-neon-lights/source/dancefloor.glb');
  
  // Create multiple floor instances
  const floorInstances = useRef<THREE.Group[]>([]);
  
  // Load textures
  const textures = useTexture([
    '/stages/animated-dance-floor-neon-lights/textures/pattern-light_2.png',
    '/stages/animated-dance-floor-neon-lights/textures/pattern-light2_4.png',
    '/stages/animated-dance-floor-neon-lights/textures/square-infinity_0.png'
  ]);

  // Create infinite ground texture
  const infiniteTexture = textures[2]; // Use square-infinity texture
  infiniteTexture.wrapS = THREE.RepeatWrapping;
  infiniteTexture.wrapT = THREE.RepeatWrapping;
  infiniteTexture.repeat.set(50, 50); // Repeat 50 times in each direction

  useEffect(() => {
    if (scene) {
      const lights: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Identify light panels by name or material properties
          if (child.name.includes('light') || 
              child.name.includes('panel') ||
              child.name.includes('neon')) {
            lights.push(child);
            
            // Assign random texture
            const textureIndex = Math.floor(Math.random() * textures.length);
            const material = child.material as THREE.MeshStandardMaterial;
            if (material) {
              material.map = textures[textureIndex];
              material.emissive = new THREE.Color(0x4400ff);
              material.emissiveIntensity = 0.5;
              material.needsUpdate = true;
            }
          }
        }
      });
      setLightObjects(lights);
      console.log(`Found ${lights.length} light objects`);
    }
  }, [scene, textures]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      // Subtle rotation animation for the dance floor
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    }
    
    // Animate individual light panels with random disco effect
    lightObjects.forEach((light, index) => {
      if (light.material) {
        const material = light.material as THREE.MeshStandardMaterial;
        
        // Each light has its own random timing
        const randomOffset = index * 1.7; // Prime number for randomness
        const fastBeat = time * 4 + randomOffset; // Faster rhythm
        
        // Random on/off pattern - using noise-like function
        const randomFactor = Math.sin(fastBeat) * Math.cos(fastBeat * 1.3) * Math.sin(fastBeat * 0.7);
        const isOn = randomFactor > 0.1; // Threshold for on/off
        
        // Intensity with some variation
        const baseIntensity = isOn ? 1 : 0;
        const flicker = 1 + Math.sin(time * 12 + randomOffset) * 0.1; // Slight flicker
        const finalIntensity = baseIntensity * flicker;
        
        material.emissiveIntensity = finalIntensity * 3;
        
        // Random color selection for disco effect
        const sambaColors = [
          new THREE.Color(0xff0040), // Hot Pink
          new THREE.Color(0x00ff80), // Neon Green  
          new THREE.Color(0x4080ff), // Electric Blue
          new THREE.Color(0xff8000), // Orange
          new THREE.Color(0x8000ff), // Purple
          new THREE.Color(0xffff00), // Yellow
          new THREE.Color(0x00ffff), // Cyan
          new THREE.Color(0xff0080)  // Magenta
        ];
        
        // Change color periodically with random timing
        const colorChangeSpeed = 0.5 + (index % 3) * 0.3; // Different speeds
        const colorIndex = Math.floor((time * colorChangeSpeed + randomOffset) % sambaColors.length);
        
        if (isOn) {
          material.emissive = sambaColors[colorIndex];
        } else {
          material.emissive = new THREE.Color(0x000000); // Off
        }
      }
    });
  });

  // Configure materials and shadows
  if (scene) {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        
        // Enhance neon materials
        if (child.material && (child.material as THREE.MeshStandardMaterial).emissive) {
          const material = child.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = 1.5;
        }
      }
    });
  }

  const createFloorGrid = () => {
    const floors = [];
    const gridSize = 5; // 5x5 grid of floors
    const floorSpacing = 4; // Distance between each floor copy
    const center = Math.floor(gridSize / 2);
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const posX = (x - center) * floorSpacing;
        const posZ = (z - center) * floorSpacing;
        const isCenter = x === center && z === center;
        
        floors.push(
          <group 
            key={`floor-${x}-${z}`}
            position={[posX, -0.1, posZ]} 
            scale={[2, 1, 2]}
          >
            <primitive 
              object={scene.clone()} 
              ref={isCenter ? groupRef : null}
            />
          </group>
        );
      }
    }
    return floors;
  };

  return (
    <>
      {/* Grid of dance floors */}
      {scene && createFloorGrid()}
      
      {/* Base ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#0a0a15"
          roughness={1}
          metalness={0}
        />
      </mesh>
    </>
  );
}

// Preload dance floor
useGLTF.preload('/stages/animated-dance-floor-neon-lights/source/dancefloor.glb');
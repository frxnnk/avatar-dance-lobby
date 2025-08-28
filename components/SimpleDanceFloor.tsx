'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SimpleDanceFloorProps {
  gridSize?: number;
  squareSize?: number;
  spacing?: number;
}

export default function SimpleDanceFloor({ 
  gridSize = 20, 
  squareSize = 0.5, 
  spacing = 0.05 
}: SimpleDanceFloorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<THREE.Mesh[]>([]);

  // Create grid of light panels
  const totalSize = (squareSize + spacing) * gridSize;

  const createLightPanels = () => {
    const panels = [];
    const lights: THREE.Mesh[] = [];

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const posX = (x - gridSize / 2) * (squareSize + spacing);
        const posZ = (z - gridSize / 2) * (squareSize + spacing);
        const index = x * gridSize + z;

        panels.push(
          <mesh
            key={`panel-${x}-${z}`}
            position={[posX, -0.1, posZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            ref={(ref) => {
              if (ref) lights[index] = ref;
            }}
          >
            <planeGeometry args={[squareSize, squareSize]} />
            <meshStandardMaterial
              color="#1a1a1a"
              emissive="#ff0080"
              emissiveIntensity={0.2}
              roughness={0.05}
              metalness={0.9}
            />
          </mesh>
        );
      }
    }

    lightsRef.current = lights;
    return panels;
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate each light panel individually with more realistic timing
    lightsRef.current.forEach((panel, index) => {
      if (panel && panel.material) {
        const material = panel.material as THREE.MeshStandardMaterial;
        
        // Create unique timing for each panel - slower and more realistic
        const x = Math.floor(index / gridSize);
        const z = index % gridSize;
        const offset = (x * 0.5 + z * 0.8) * 3;
        const slowBeat = time * 1.2 + offset; // Much slower animation
        
        // More realistic on/off pattern - longer duration states
        const mainWave = Math.sin(slowBeat * 0.3);
        const secondaryWave = Math.sin(slowBeat * 0.7 + offset);
        const noise = mainWave * secondaryWave;
        const isOn = noise > -0.3; // More lights stay on longer
        
        // Slower color cycling with better neon colors
        const colorPhase = (time * 0.2 + offset) % (Math.PI * 2);
        const neonColors = [
          new THREE.Color(0xff1493), // Deep Pink (neon)
          new THREE.Color(0x00ffff), // Cyan (neon)
          new THREE.Color(0xff4500), // Orange Red (neon)
          new THREE.Color(0x9400d3), // Violet (neon)
          new THREE.Color(0x00ff00), // Lime Green (neon)
          new THREE.Color(0xffff00), // Yellow (neon)
          new THREE.Color(0xff69b4), // Hot Pink (neon)
          new THREE.Color(0x1e90ff)  // Dodger Blue (neon)
        ];
        
        const colorIndex = Math.floor((colorPhase / (Math.PI * 2)) * neonColors.length);
        const color = neonColors[colorIndex] || neonColors[0];
        
        if (isOn) {
          material.emissive = color;
          // Reduced glow intensity
          const pulse = 1 + Math.sin(time * 2 + offset) * 0.2;
          material.emissiveIntensity = 0.6 * pulse;
          
          // Less bright base color
          material.color = color.clone().multiplyScalar(0.15);
        } else {
          // Even dimmer when off
          material.emissive = color.clone().multiplyScalar(0.05);
          material.emissiveIntensity = 0.1;
          material.color = new THREE.Color(0x1a1a1a);
        }
      }
    });
  });

  return (
    <>
      <group ref={groupRef}>
        {createLightPanels()}
      </group>
      
      {/* Base floor for structure - darker and more reflective */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <planeGeometry args={[totalSize * 1.5, totalSize * 1.5]} />
        <meshStandardMaterial 
          color="#050505"
          roughness={0.1}
          metalness={0.8}
          envMapIntensity={0.8}
        />
      </mesh>
    </>
  );
}
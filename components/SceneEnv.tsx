'use client';

import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

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

interface SceneEnvProps {
  enableBloom?: boolean;
  lightingPreset?: LightingPreset;
}

export default function SceneEnv({ enableBloom = true, lightingPreset }: SceneEnvProps) {
  // Default club lighting preset
  const defaultPreset: LightingPreset = {
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
  };
  
  const preset = lightingPreset || defaultPreset;

  // Create gradient background
  const skyMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0d1b2a) },    // Dark blue
        bottomColor: { value: new THREE.Color(0x1a0a2e) },  // Dark purple
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    return material;
  }, []);

  return (
    <>
      {/* Environment */}
      <Environment
        preset="night"
        background={false}
        environmentIntensity={preset.environmentIntensity}
      />
      
      {/* Gradient Sky Background */}
      <mesh scale={[100, 100, 100]}>
        <sphereGeometry args={[1, 32, 15]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>
      
      {/* Atmospheric fog with gradient tint */}
      <fog attach="fog" args={['#0f1829', 15, 60]} />
      
      {/* Main Key Light */}
      <directionalLight
        position={[2, 4, 3]}
        intensity={preset.keyLightIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        color={preset.keyLightColor}
      />
      
      {/* Top Fill Light */}
      <directionalLight
        position={[0, 6, 1]}
        intensity={preset.topLightIntensity}
        color={preset.topLightColor}
        castShadow={false}
      />
      
      {/* Ambient Light */}
      <ambientLight intensity={preset.ambientIntensity} color={preset.ambientColor} />
      
      {/* Colored Rim Lights */}
      <directionalLight
        position={[-2, 2, -3]}
        intensity={preset.rimLight1Intensity}
        color={preset.rimLight1Color}
      />
      
      <directionalLight
        position={[2, 2, -3]}
        intensity={preset.rimLight2Intensity}
        color={preset.rimLight2Color}
      />
      
      {/* Animated disco club lights from above */}
      
      {/* Bloom Post-processing */}
      {enableBloom && (
        <EffectComposer>
          <Bloom 
            intensity={preset.bloomIntensity}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            mipmapBlur={true}
            radius={0.8}
          />
        </EffectComposer>
      )}
    </>
  );
}
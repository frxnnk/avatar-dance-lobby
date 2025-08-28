'use client';

import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

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
  // Warm balanced lighting preset
  const defaultPreset: LightingPreset = {
    name: "Warm Studio",
    keyLightIntensity: 1.8,
    keyLightColor: "#ffeaa7",
    topLightIntensity: 1.0,
    topLightColor: "#fff2d4", 
    ambientIntensity: 0.6,
    ambientColor: "#f4f1e8",
    rimLight1Intensity: 0.5,
    rimLight1Color: "#ffb84d",
    rimLight2Intensity: 0.4,
    rimLight2Color: "#87ceeb",
    environmentIntensity: 0.3,
    bloomIntensity: 0.3
  };
  
  const preset = lightingPreset || defaultPreset;
  return (
    <>
      {/* Environment */}
      <Environment
        preset="night"
        background={false}
        environmentIntensity={preset.environmentIntensity}
      />
      
      {/* Deep black background */}
      <color attach="background" args={['#000000']} />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#000000', 15, 60]} />
      
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
      
      {/* Multiple Rim Lights for Better Coverage */}
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
      
      {/* Front Fill Light - Warm */}
      <directionalLight
        position={[0, 1.5, 4]}
        intensity={0.8}
        color="#ffd89b"
      />
      
      {/* Side Lights - Warmer and Dimmer */}
      <pointLight
        position={[-3, 1.5, 1]}
        intensity={0.6}
        color="#ffe4b5"
        distance={8}
      />
      
      <pointLight
        position={[3, 1.5, 1]}
        intensity={0.6}
        color="#ffe4b5"
        distance={8}
      />
      
      {/* Subtle Back Light */}
      <directionalLight
        position={[0, 2, -3]}
        intensity={0.4}
        color="#f39c12"
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
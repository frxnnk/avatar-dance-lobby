'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { loadClip, applyClip, AnimationName, ANIMATION_NAMES } from '../lib/animLoader';

interface ModelPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

interface AvatarProps {
  currentAnimation: AnimationName;
  onAnimationChange?: (animation: AnimationName) => void;
  onSceneLoad?: (scene: THREE.Group) => void;
  position?: ModelPosition;
}

export default function Avatar({ currentAnimation, onAnimationChange, onSceneLoad, position }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [useTestMesh, setUseTestMesh] = useState(false); // Toggle for testing

  const crossfadeTo = useCallback((animationName: AnimationName) => {
    if (!mixerRef.current || !actionsRef.current[animationName]) {
      console.warn(`Animation ${animationName} not available`);
      return;
    }

    const newAction = actionsRef.current[animationName];
    const currentAction = currentActionRef.current;

    if (currentAction && currentAction !== newAction) {
      currentAction.fadeOut(0.3);
    }

    newAction.reset().fadeIn(0.3).play();
    currentActionRef.current = newAction;
    
    if (groupRef.current) {
      groupRef.current.position.set(0, -0.046, 0);
    }
  }, []);

  // Function to create procedural animations using real bone names like Samba
  const createProceduralAnimation = (animName: string): THREE.AnimationClip => {
    // Use common RPM bone names that should exist
    const createBoneAnimation = (boneName: string, property: string, times: number[], values: number[]) => {
      return new THREE.VectorKeyframeTrack(`${boneName}.${property}`, times, values);
    };
    
    switch (animName) {
      default: // Simple fallback animation
        return new THREE.AnimationClip(animName, 2, [
          createBoneAnimation('Hips', 'quaternion', [0, 0.5, 1, 1.5, 2], 
            [0,0,0,1, 0.08,0,0.08,1, 0,0,0,1, -0.08,0,-0.08,1, 0,0,0,1]),
          createBoneAnimation('Spine', 'quaternion', [0, 1, 2], 
            [0,0,0,1, 0.05,0,0,1, 0,0,0,1])
        ]);
    }
  };

  // Load Character_output.fbx
  useEffect(() => {
    const fbxLoader = new FBXLoader();
    
    const loadCharacter = async () => {
      try {
        setIsLoading(true);
        console.log('🎭 Loading Character_output.fbx...');
        
        // Try loading the Character_output.fbx - check both locations
        let fbxModel;
        try {
          // Try main location first
          console.log('Trying /Character_output.fbx...');
          fbxModel = await fbxLoader.loadAsync('/Character_output.fbx');
        } catch (err1) {
          console.warn('Failed to load from root, trying biped folder...');
          try {
            // Try biped folder
            fbxModel = await fbxLoader.loadAsync('/biped/biped/Character_output.fbx');
          } catch (err2) {
            console.error('FBX Load Error from both locations:', err1, err2);
            throw new Error('Could not load FBX from any location');
          }
        }
        
        console.log('✅ Character_output.fbx loaded successfully!');
        
        // Get bounding box to understand model size
        const box = new THREE.Box3().setFromObject(fbxModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('📊 Model info:', {
          size: { x: size.x, y: size.y, z: size.z },
          center: { x: center.x, y: center.y, z: center.z },
          childCount: fbxModel.children.length,
          type: fbxModel.type
        });
        
        // Use character positioning calibrated for the scene (as per CLAUDE.md)
        const pos = position || { x: 0, y: -0.046, z: 0, scale: 0.010, rotationX: 0, rotationY: 0, rotationZ: 0 };
        fbxModel.scale.setScalar(pos.scale);
        fbxModel.position.set(pos.x, pos.y, pos.z);
        fbxModel.rotation.set(pos.rotationX, pos.rotationY, pos.rotationZ);
        
        // Process materials and fix skeleton issues
        fbxModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              // Handle both single materials and arrays of materials
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              
              const processedMaterials = materials.map(mat => {
                // Clone the material to avoid affecting other instances
                const material = mat.clone();
                
                // If it's a basic material, convert to standard material for lighting
                if (material instanceof THREE.MeshBasicMaterial) {
                  return new THREE.MeshStandardMaterial({
                    map: material.map,
                    color: material.color,
                    transparent: false, // Fix transparency issue
                    opacity: 1.0, // Make fully opaque
                    side: material.side,
                    alphaTest: 0,
                    roughness: 0.8,
                    metalness: 0.1
                  });
                } else if (material instanceof THREE.MeshStandardMaterial) {
                  // Ensure standard material properties are set for good lighting response
                  material.roughness = material.roughness !== undefined ? material.roughness : 0.8;
                  material.metalness = material.metalness !== undefined ? material.metalness : 0.1;
                  material.transparent = false; // Fix transparency
                  material.opacity = 1.0; // Make fully opaque
                  return material;
                } else {
                  // For other material types, try to make them opaque
                  if ('transparent' in material) material.transparent = false;
                  if ('opacity' in material) material.opacity = 1.0;
                  return material;
                }
              });
              
              // Assign processed materials back
              child.material = Array.isArray(child.material) ? processedMaterials : processedMaterials[0];
              
              // Enable shadow casting and receiving
              child.castShadow = true;
              child.receiveShadow = true;
            }
            
            // Keep SkinnedMesh but ensure skeleton is properly initialized
            if (child instanceof THREE.SkinnedMesh && child.skeleton) {
              console.log(`🦴 Initializing skeleton for: ${child.name}, bones: ${child.skeleton.bones.length}`);
              
              const skeleton = child.skeleton;
              
              // Ensure skeleton has proper structure
              if (skeleton.bones && skeleton.bones.length > 0) {
                // Initialize bone matrices if needed
                if (!skeleton.boneMatrices) {
                  skeleton.boneMatrices = new Float32Array(skeleton.bones.length * 16);
                }
                
                // Ensure all bones have proper matrices
                skeleton.bones.forEach((bone, index) => {
                  if (!bone.matrixWorld) {
                    bone.matrixWorld = new THREE.Matrix4();
                  }
                  bone.updateMatrixWorld(true);
                });
                
                // Calculate inverse matrices safely
                try {
                  skeleton.calculateInverses();
                } catch (error) {
                  console.warn('Skeleton inverse calculation error:', error);
                }
                
                console.log(`✅ Skeleton initialized for ${child.name}`);
              }
            }
          }
        });

        setScene(fbxModel);
        if (onSceneLoad) {
          onSceneLoad(fbxModel);
        }
      } catch (error) {
        console.error('❌ Failed to load Character_output.fbx:', error);
        console.error('Error details:', error);
        setError(`Failed to load character: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, []);

  // Update model position when position prop changes
  useEffect(() => {
    if (scene && position) {
      scene.scale.setScalar(position.scale);
      scene.position.set(position.x, position.y, position.z);
      scene.rotation.set(position.rotationX, position.rotationY, position.rotationZ);
    }
  }, [scene, position]);

  useEffect(() => {
    if (!scene) return;

    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;

    // Configure shadows and bones
    let avatarBones: THREE.Bone[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child instanceof THREE.Bone) {
        avatarBones.push(child);
      }
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        avatarBones = child.skeleton.bones;
      }
    });

    console.log(`🦴 Found ${avatarBones.length} bones in avatar`);

    const loadAnimations = async () => {
      try {
        setIsLoading(true);
        
        // Create idle animation from built-in or procedural
        const builtInAnimations = scene.animations || [];
        if (builtInAnimations.length > 0) {
          const idleClip = builtInAnimations[0];
          const idleAction = mixer.clipAction(idleClip);
          idleAction.setLoop(THREE.LoopRepeat, Infinity);
          actionsRef.current[ANIMATION_NAMES.IDLE] = idleAction;
          console.log(`✅ Using built-in idle: ${idleClip.name}`);
        } else {
          // Simple breathing idle animation that doesn't rely on bones
          const idleClip = new THREE.AnimationClip(ANIMATION_NAMES.IDLE, 4, [
            new THREE.VectorKeyframeTrack('.position[y]', [0, 2, 4], [-0.046, -0.044, -0.046])
          ]);
          const idleAction = mixer.clipAction(idleClip);
          idleAction.setLoop(THREE.LoopRepeat, Infinity);
          actionsRef.current[ANIMATION_NAMES.IDLE] = idleAction;
          console.log('✅ Created procedural idle');
        }

        // Load FBX dance animations - start with just Hip Hop to test
        const essentialAnimations = [
          { name: ANIMATION_NAMES.HIP_HOP_DANCE, file: '/biped/biped/Animation_Hip_Hop_Dance_withSkin.fbx', emoji: '🎤', desc: 'Hip Hop Dance' }
        ];

        // Load each animation with error handling
        for (const animation of essentialAnimations) {
          try {
            console.log(`🎵 Loading ${animation.desc} from ${animation.file}...`);
            const clip = await loadClip(animation.file);
            const action = applyClip(mixer, scene, clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            actionsRef.current[animation.name] = action;
            console.log(`✅ ${animation.emoji} ${animation.desc} loaded!`);
          } catch (error) {
            console.warn(`❌ Failed to load ${animation.desc}:`, error);
            // Create a simple fallback dance animation
            const fallbackClip = new THREE.AnimationClip(animation.name, 2, [
              new THREE.VectorKeyframeTrack('.rotation[y]', [0, 0.5, 1, 1.5, 2], [0, 0.3, 0, -0.3, 0]),
              new THREE.VectorKeyframeTrack('.position[y]', [0, 0.5, 1, 1.5, 2], [-0.046, -0.042, -0.046, -0.042, -0.046])
            ]);
            const fallbackAction = mixer.clipAction(fallbackClip);
            fallbackAction.setLoop(THREE.LoopRepeat, Infinity);
            actionsRef.current[animation.name] = fallbackAction;
            console.log(`🔄 Created fallback for ${animation.desc}`);
          }
        }

        // Start with idle animation
        if (actionsRef.current[ANIMATION_NAMES.IDLE]) {
          crossfadeTo(ANIMATION_NAMES.IDLE);
        }

        setIsLoading(false);
        console.log('🎉 Animation system loaded!');
        
      } catch (error) {
        console.error('Failed to load animations:', error);
        setError('Failed to load avatar animations');
        setIsLoading(false);
      }
    };

    loadAnimations();

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [scene, crossfadeTo]);

  // Handle animation changes
  useEffect(() => {
    if (!isLoading && !error) {
      crossfadeTo(currentAnimation);
    }
  }, [currentAnimation, isLoading, error, crossfadeTo]);

  // Animation loop with robust error handling
  useFrame((_, delta) => {
    // Update animation mixer with comprehensive error handling
    if (mixerRef.current && scene) {
      try {
        // Pre-validate all skeletons before animation update
        let allSkeletonsValid = true;
        scene.traverse((child) => {
          if (child instanceof THREE.SkinnedMesh && child.skeleton) {
            const skeleton = child.skeleton;
            if (!skeleton.boneMatrices || skeleton.bones.some(bone => !bone.matrixWorld)) {
              allSkeletonsValid = false;
              // Try to fix the skeleton
              skeleton.bones.forEach(bone => {
                if (!bone.matrixWorld) {
                  bone.matrixWorld = new THREE.Matrix4();
                }
                bone.updateMatrixWorld(true);
              });
              if (!skeleton.boneMatrices) {
                skeleton.boneMatrices = new Float32Array(skeleton.bones.length * 16);
              }
            }
          }
        });
        
        if (allSkeletonsValid) {
          mixerRef.current.update(delta);
        } else {
          console.warn('Skipping animation update - skeleton validation failed');
        }
      } catch (error) {
        console.warn('Animation mixer error:', error);
        // Don't crash, just skip this frame
      }
    }
    
    // Keep character centered
    if (groupRef.current) {
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
      // Ensure Y position stays at calibrated level if no animation is active
      if (!mixerRef.current || !currentActionRef.current?.isRunning()) {
        groupRef.current.position.y = -0.046;
      }
    }
  });

  // Expose play function for external control
  useEffect(() => {
    if (onAnimationChange) {
      (window as any).playAnimation = (animName: AnimationName) => {
        onAnimationChange(animName);
      };
    }
  }, [onAnimationChange]);

  if (error) {
    console.log('🔴 Rendering error state:', error);
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.5, 2, 0.5]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
    );
  }

  if (isLoading) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshStandardMaterial 
            color="#4a90e2" 
            transparent 
            opacity={0.6}
            emissive="#1a365d"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Subtle floating animation */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.15, 6, 4]} />
          <meshStandardMaterial 
            color="#6bb6ff" 
            transparent 
            opacity={0.4}
            emissive="#2d5aa0"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    );
  }

  // Create a test character mesh for debugging
  const TestCharacter = () => (
    <group>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.5, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      <mesh position={[0.5, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, -1.2, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, -1.2, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );

  return (
    <group ref={groupRef} dispose={null}>
      {/* Show test mesh if no scene loaded or for debugging */}
      {!scene ? (
        <TestCharacter />
      ) : (
        <primitive object={scene} />
      )}
      
      {/* Debug position indicator */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[2, 0.05, 2]} />
        <meshStandardMaterial color="green" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Character_output.fbx will be loaded dynamically
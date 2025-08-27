'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { loadClip, applyClip, AnimationName, ANIMATION_NAMES } from '../lib/animLoader';

interface AvatarProps {
  currentAnimation: AnimationName;
  onAnimationChange?: (animation: AnimationName) => void;
  onSceneLoad?: (scene: THREE.Group) => void;
}

export default function Avatar({ currentAnimation, onAnimationChange, onSceneLoad }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);

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
      groupRef.current.position.set(0, -0.060, 0);
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
        
        const fbxModel = await fbxLoader.loadAsync('/Character_output.fbx');
        console.log('✅ Character_output.fbx loaded successfully!');
        
        // Scale and position the character
        fbxModel.scale.setScalar(0.010); // Correct scale
        fbxModel.position.set(0, -0.046, 0); // Final position
        fbxModel.rotation.x = 1.571; // Final rotation
        
        // Process materials to respond to lighting
        fbxModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              // Clone the material to avoid affecting other instances
              const material = child.material.clone();
              
              // If it's a basic material, convert to standard material for lighting
              if (material instanceof THREE.MeshBasicMaterial) {
                const standardMaterial = new THREE.MeshStandardMaterial({
                  map: material.map,
                  color: material.color,
                  transparent: material.transparent,
                  opacity: material.opacity,
                  side: material.side,
                  alphaTest: material.alphaTest
                });
                child.material = standardMaterial;
              } else if (material instanceof THREE.MeshStandardMaterial) {
                // Ensure standard material properties are set for good lighting response
                material.roughness = material.roughness !== undefined ? material.roughness : 0.8;
                material.metalness = material.metalness !== undefined ? material.metalness : 0.1;
                child.material = material;
              }
              
              // Enable shadow casting and receiving
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }
        });

        setScene(fbxModel);
        if (onSceneLoad) {
          onSceneLoad(fbxModel);
        }
      } catch (error) {
        console.error('❌ Failed to load Character_output.fbx:', error);
        setError('Failed to load character');
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, []);

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

    // DEBUG: Log actual bone names in avatar
    console.log('🦴 Avatar bones found:');
    avatarBones.slice(0, 10).forEach((bone, i) => {
      console.log(`  Bone ${i}: "${bone.name}"`);
    });
    console.log(`  Total bones: ${avatarBones.length}`);

    // Position already set during FBX loading

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
          const idleClip = new THREE.AnimationClip(ANIMATION_NAMES.IDLE, 4, [
            new THREE.VectorKeyframeTrack('.scale', [0, 2, 4], [1, 1, 1, 1.002, 1.002, 1.002, 1, 1, 1])
          ]);
          const idleAction = mixer.clipAction(idleClip);
          idleAction.setLoop(THREE.LoopRepeat, Infinity);
          actionsRef.current[ANIMATION_NAMES.IDLE] = idleAction;
          console.log('✅ Created procedural idle');
        }

        // Load ALL animations from biped folder - these are compatible with Character_output
        const allAnimations = [
          // Dance animations
          { name: ANIMATION_NAMES.ALL_NIGHT_DANCE, file: '/biped/biped/Animation_All_Night_Dance_withSkin.glb', emoji: '🌙', desc: 'All Night Dance' },
          { name: ANIMATION_NAMES.ARM_CIRCLE_SHUFFLE, file: '/biped/biped/Animation_Arm_Circle_Shuffle_withSkin.glb', emoji: '🔄', desc: 'Arm Circle Shuffle' },
          { name: ANIMATION_NAMES.BOOM_DANCE, file: '/biped/biped/Animation_Boom_Dance_withSkin.glb', emoji: '💥', desc: 'Boom Dance' },
          { name: ANIMATION_NAMES.CRYSTAL_BEADS, file: '/biped/biped/Animation_Crystal_Beads_withSkin.glb', emoji: '💎', desc: 'Crystal Beads' },
          { name: ANIMATION_NAMES.FUNNY_DANCING, file: '/biped/biped/Animation_FunnyDancing_01_withSkin.glb', emoji: '😂', desc: 'Funny Dancing' },
          { name: ANIMATION_NAMES.POP_DANCE, file: '/biped/biped/Animation_Pop_Dance_LSA2_withSkin.glb', emoji: '🎵', desc: 'Pop Dance' },
          { name: ANIMATION_NAMES.YOU_GROOVE, file: '/biped/biped/Animation_You_Groove_withSkin.glb', emoji: '🕺', desc: 'You Groove' },
          { name: ANIMATION_NAMES.JAZZ_DANCE, file: '/biped/biped/Animation_jazz_danc_withSkin.glb', emoji: '🎷', desc: 'Jazz Dance' },
          // Idle poses
          { name: ANIMATION_NAMES.IDLE_4, file: '/biped/biped/Animation_Idle_4_withSkin.glb', emoji: '🧘', desc: 'Idle Pose 4' },
          { name: ANIMATION_NAMES.IDLE_9, file: '/biped/biped/Animation_Idle_9_withSkin.glb', emoji: '🕴️', desc: 'Idle Pose 9' },
          // Movement animations
          { name: ANIMATION_NAMES.RUNNING, file: '/biped/biped/Animation_Running_withSkin.glb', emoji: '🏃', desc: 'Running' },
          { name: ANIMATION_NAMES.SKIP_FORWARD, file: '/biped/biped/Animation_Skip_Forward_withSkin.glb', emoji: '⏩', desc: 'Skip Forward' },
          { name: ANIMATION_NAMES.TEXTING_WALK, file: '/biped/biped/Animation_Texting_Walk_withSkin.glb', emoji: '📱', desc: 'Texting Walk' },
          { name: ANIMATION_NAMES.WALKING_WOMAN, file: '/biped/biped/Animation_Walking_Woman_withSkin.glb', emoji: '👩‍🦳', desc: 'Walking Woman' },
          { name: ANIMATION_NAMES.WALKING, file: '/biped/biped/Animation_Walking_withSkin.glb', emoji: '🚶', desc: 'Walking' },
          { name: ANIMATION_NAMES.WAVE_ONE_HAND, file: '/biped/biped/Animation_Wave_One_Hand_withSkin.glb', emoji: '👋', desc: 'Wave One Hand' }
        ];

        // Load each animation from the biped folder
        for (const animation of allAnimations) {
          try {
            console.log(`🎵 Loading ${animation.desc} animation from ${animation.file}...`);
            const clip = await loadClip(animation.file);
            const action = applyClip(mixer, scene, clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            actionsRef.current[animation.name] = action;
            console.log(`✅ ${animation.emoji} ${animation.desc} animation loaded!`);
          } catch (error) {
            console.warn(`❌ Failed to load ${animation.desc}:`, error);
            // Skip creating procedural fallbacks for now
          }
        }

        // Start with All Night Dance
        if (actionsRef.current[ANIMATION_NAMES.ALL_NIGHT_DANCE]) {
          crossfadeTo(ANIMATION_NAMES.ALL_NIGHT_DANCE);
        }

        setIsLoading(false);
        console.log('🎉 All animations loaded successfully!');
        
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

  // Animation loop
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    if (groupRef.current) {
      const time = Date.now() * 0.001;
      const baseY = -0.060; // Avatar at floor level
      
      // Subtle breathing animation when not dancing
      if (currentAnimation === ANIMATION_NAMES.IDLE) {
        groupRef.current.position.y = baseY + Math.sin(time * 1.2) * 0.005;
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.02;
      } else {
        // Keep stable position during dances
        groupRef.current.position.y = baseY;
        groupRef.current.rotation.y = 0;
      }
      
      // Always keep centered
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
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
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 2, 0.5]} />
          <meshStandardMaterial color="red" />
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

  return (
    <group ref={groupRef} dispose={null}>
      {scene && <primitive object={scene} />}
    </group>
  );
}

// Character_output.fbx will be loaded dynamically
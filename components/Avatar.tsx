'use client';

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { loadClip, applyClip, AnimationName, ANIMATION_NAMES } from '../lib/animLoader';

interface AvatarProps {
  currentAnimation: AnimationName;
  onAnimationChange?: (animation: AnimationName) => void;
  onSceneLoad?: (scene: THREE.Group) => void;
  showLoadingPlaceholder?: boolean;
}

const Avatar = memo(function Avatar({ currentAnimation, onAnimationChange, onSceneLoad, showLoadingPlaceholder = false }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
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

  // Load Character_output.fbx with optimizations
  useEffect(() => {
    const fbxLoader = new FBXLoader();
    
    const loadCharacter = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(10);
        console.log('🎭 Loading Character_output.fbx...');
        
        // Check if we've loaded before for faster subsequent loads
        const cacheKey = 'avatarLoadTime';
        const lastLoad = localStorage.getItem(cacheKey);
        const isFastLoad = lastLoad && (Date.now() - parseInt(lastLoad) < 10 * 60 * 1000); // 10 min cache
        
        if (isFastLoad) {
          setLoadingProgress(50);
          console.log('💨 Fast loading mode activated');
        }
        
        setLoadingProgress(30);
        const fbxModel = await fbxLoader.loadAsync('/Character_output.fbx');
        
        setLoadingProgress(60);
        console.log('✅ Character_output.fbx loaded successfully!');
        
        // Cache the load time
        localStorage.setItem(cacheKey, Date.now().toString());
        
        // Scale and position the character
        fbxModel.scale.setScalar(0.010); // Correct scale
        fbxModel.position.set(0, -0.046, 0); // Final position
        fbxModel.rotation.x = 1.571; // Final rotation
        
        setLoadingProgress(70);
        console.log('⚙️ Processing materials and skeleton...');
        
        // Process materials and fix skeleton issues - OPTIMIZED
        const materialCache = new Map<string, THREE.Material>();
        
        fbxModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              // Handle both single materials and arrays of materials
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              
              const processedMaterials = materials.map(mat => {
                // Create cache key for material reuse
                const cacheKey = `${mat.type}_${mat.uuid}`;
                
                if (materialCache.has(cacheKey)) {
                  return materialCache.get(cacheKey)!;
                }
                
                let optimizedMaterial: THREE.Material;
                
                // If it's a basic material, convert to standard material for lighting
                if (mat instanceof THREE.MeshBasicMaterial) {
                  optimizedMaterial = new THREE.MeshStandardMaterial({
                    map: mat.map,
                    color: mat.color,
                    transparent: false,
                    opacity: 1.0,
                    side: mat.side,
                    alphaTest: 0,
                    roughness: 0.8,
                    metalness: 0.1
                  });
                } else if (mat instanceof THREE.MeshStandardMaterial) {
                  // Reuse existing material, just fix properties
                  mat.roughness = mat.roughness !== undefined ? mat.roughness : 0.8;
                  mat.metalness = mat.metalness !== undefined ? mat.metalness : 0.1;
                  mat.transparent = false;
                  mat.opacity = 1.0;
                  optimizedMaterial = mat;
                } else {
                  // For other material types, try to make them opaque
                  if ('transparent' in mat) (mat as any).transparent = false;
                  if ('opacity' in mat) (mat as any).opacity = 1.0;
                  optimizedMaterial = mat;
                }
                
                materialCache.set(cacheKey, optimizedMaterial);
                return optimizedMaterial;
              });
              
              // Assign processed materials back
              child.material = Array.isArray(child.material) ? processedMaterials : processedMaterials[0];
              
              // Enable shadow casting and receiving
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Optimize geometry if possible
              if (child.geometry && !child.geometry.index) {
                child.geometry.setIndex(null); // Force indexed geometry for better performance
              }
            }
            
            // Keep SkinnedMesh and ensure skeleton is properly initialized
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

        setLoadingProgress(90);
        console.log('🎯 Finalizing character setup...');
        
        setScene(fbxModel);
        if (onSceneLoad) {
          onSceneLoad(fbxModel);
        }
        
        setLoadingProgress(100);
        
        // Small delay to show completion
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
        
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

        // Prioritized loading: Load most popular animations first
        const highPriorityAnimations = [
          // Most used animations first
          { name: ANIMATION_NAMES.IDLE_4, file: '/biped/biped/Animation_Idle_4_withSkin.glb', emoji: '🧘', desc: 'Idle Pose 4', priority: 1 },
          { name: ANIMATION_NAMES.JAZZ_DANCE, file: '/biped/biped/Animation_jazz_danc_withSkin.glb', emoji: '🎷', desc: 'Jazz Dance', priority: 2 },
          { name: ANIMATION_NAMES.POP_DANCE, file: '/biped/biped/Animation_Pop_Dance_LSA2_withSkin.glb', emoji: '🎵', desc: 'Pop Dance', priority: 2 },
        ];
        
        const mediumPriorityAnimations = [
          { name: ANIMATION_NAMES.YOU_GROOVE, file: '/biped/biped/Animation_You_Groove_withSkin.glb', emoji: '🕺', desc: 'You Groove', priority: 3 },
          { name: ANIMATION_NAMES.BOOM_DANCE, file: '/biped/biped/Animation_Boom_Dance_withSkin.glb', emoji: '💥', desc: 'Boom Dance', priority: 3 },
          { name: ANIMATION_NAMES.CRYSTAL_BEADS, file: '/biped/biped/Animation_Crystal_Beads_withSkin.glb', emoji: '💎', desc: 'Crystal Beads', priority: 3 },
          { name: ANIMATION_NAMES.FUNNY_DANCING, file: '/biped/biped/Animation_FunnyDancing_01_withSkin.glb', emoji: '😂', desc: 'Funny Dancing', priority: 3 },
        ];

        const backgroundAnimations = [
          // Load these after initial setup
          { name: ANIMATION_NAMES.ALL_NIGHT_DANCE, file: '/biped/biped/Animation_All_Night_Dance_withSkin.glb', emoji: '🌙', desc: 'All Night Dance' },
          { name: ANIMATION_NAMES.ARM_CIRCLE_SHUFFLE, file: '/biped/biped/Animation_Arm_Circle_Shuffle_withSkin.glb', emoji: '🔄', desc: 'Arm Circle Shuffle' },
          { name: ANIMATION_NAMES.IDLE_9, file: '/biped/biped/Animation_Idle_9_withSkin.glb', emoji: '🕴️', desc: 'Idle Pose 9' },
          { name: ANIMATION_NAMES.RUNNING, file: '/biped/biped/Animation_Running_withSkin.glb', emoji: '🏃', desc: 'Running' },
          { name: ANIMATION_NAMES.SKIP_FORWARD, file: '/biped/biped/Animation_Skip_Forward_withSkin.glb', emoji: '⏩', desc: 'Skip Forward' },
          { name: ANIMATION_NAMES.TEXTING_WALK, file: '/biped/biped/Animation_Texting_Walk_withSkin.glb', emoji: '📱', desc: 'Texting Walk' },
          { name: ANIMATION_NAMES.WALKING_WOMAN, file: '/biped/biped/Animation_Walking_Woman_withSkin.glb', emoji: '👩‍🦳', desc: 'Walking Woman' },
          { name: ANIMATION_NAMES.WALKING, file: '/biped/biped/Animation_Walking_withSkin.glb', emoji: '🚶', desc: 'Walking' },
          { name: ANIMATION_NAMES.WAVE_ONE_HAND, file: '/biped/biped/Animation_Wave_One_Hand_withSkin.glb', emoji: '👋', desc: 'Wave One Hand' }
        ];

        // Load high-priority animations first (parallel loading)
        console.log('🚀 Loading high-priority animations...');
        const loadAnimationBatch = async (animations: any[], batchName: string) => {
          const promises = animations.map(async (animation) => {
            try {
              console.log(`🎵 Loading ${animation.desc} animation from ${animation.file}...`);
              const clip = await loadClip(animation.file);
              const action = applyClip(mixer, scene, clip);
              action.setLoop(THREE.LoopRepeat, Infinity);
              actionsRef.current[animation.name] = action;
              console.log(`✅ ${animation.emoji} ${animation.desc} animation loaded!`);
              return { success: true, name: animation.name };
            } catch (error) {
              console.warn(`❌ Failed to load ${animation.desc}:`, error);
              return { success: false, name: animation.name, error };
            }
          });
          
          const results = await Promise.allSettled(promises);
          console.log(`📊 ${batchName} batch completed: ${results.filter(r => r.status === 'fulfilled').length}/${results.length} animations loaded`);
          return results;
        };
        
        // Load critical animations first
        await loadAnimationBatch(highPriorityAnimations, 'High-priority');
        
        // Immediately show the character as ready
        setIsLoading(false);
        console.log('🎉 Critical animations loaded! Character ready!');
        
        // Start with the current animation prop (respect parent control)
        if (actionsRef.current[currentAnimation]) {
          crossfadeTo(currentAnimation);
        } else if (actionsRef.current[ANIMATION_NAMES.IDLE_4]) {
          crossfadeTo(ANIMATION_NAMES.IDLE_4);
        }
        
        // Load medium-priority animations next (non-blocking)
        setTimeout(async () => {
          console.log('📦 Loading medium-priority animations...');
          await loadAnimationBatch(mediumPriorityAnimations, 'Medium-priority');
        }, 100);

        // Load low-priority animations last (in background)
        setTimeout(async () => {
          console.log('🎭 Loading low-priority background animations...');
          await loadAnimationBatch(backgroundAnimations, 'Background');
          console.log('🎯 All animations fully loaded!');
        }, 1000); // Delay to prioritize user interaction
        
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
    // Only show placeholder spheres if explicitly requested
    if (showLoadingPlaceholder) {
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
    // Return nothing while loading if placeholder is disabled
    return null;
  }

  return (
    <group ref={groupRef} dispose={null}>
      {scene && <primitive object={scene} />}
    </group>
  );
}

});

export default Avatar;

// Character_output.fbx will be loaded dynamically
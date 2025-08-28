import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();

export async function loadClip(url: string): Promise<THREE.AnimationClip> {
  try {
    const isGLB = url.toLowerCase().endsWith('.glb');
    const isFBX = url.toLowerCase().endsWith('.fbx');
    
    let animations: THREE.AnimationClip[] = [];
    
    if (isGLB) {
      const gltf = await gltfLoader.loadAsync(url);
      animations = gltf.animations;
    } else if (isFBX) {
      const fbx = await fbxLoader.loadAsync(url);
      animations = fbx.animations;
    } else {
      throw new Error(`Unsupported file format: ${url}`);
    }
    
    if (!animations || animations.length === 0) {
      throw new Error(`No animations found in ${url}`);
    }

    const clip = animations[0].clone();
    
    // Normalize clip name based on filename
    const filename = url.split('/').pop()?.replace(/\.(glb|fbx)$/i, '') || 'unknown';
    clip.name = filename;
    
    return clip;
  } catch (error) {
    console.error(`Failed to load animation clip from ${url}:`, error);
    throw error;
  }
}

// Mixamo to Ready Player Me bone mapping
const BONE_MAPPING: Record<string, string> = {
  // Core bones
  'mixamorigHips': 'Hips',
  'mixamorigSpine': 'Spine',
  'mixamorigSpine1': 'Spine1', 
  'mixamorigSpine2': 'Spine2',
  'mixamorigNeck': 'Neck',
  'mixamorigHead': 'Head',
  
  // Arms
  'mixamorigLeftShoulder': 'LeftShoulder',
  'mixamorigLeftArm': 'LeftArm',
  'mixamorigLeftForeArm': 'LeftForeArm',
  'mixamorigLeftHand': 'LeftHand',
  'mixamorigRightShoulder': 'RightShoulder',
  'mixamorigRightArm': 'RightArm', 
  'mixamorigRightForeArm': 'RightForeArm',
  'mixamorigRightHand': 'RightHand',
  
  // Legs
  'mixamorigLeftUpLeg': 'LeftUpLeg',
  'mixamorigLeftLeg': 'LeftLeg',
  'mixamorigLeftFoot': 'LeftFoot',
  'mixamorigRightUpLeg': 'RightUpLeg',
  'mixamorigRightLeg': 'RightLeg',
  'mixamorigRightFoot': 'RightFoot',
  
  // Fingers (common RPM bones)
  'mixamorigLeftHandThumb1': 'LeftHandThumb1',
  'mixamorigLeftHandThumb2': 'LeftHandThumb2',
  'mixamorigLeftHandThumb3': 'LeftHandThumb3',
  'mixamorigLeftHandIndex1': 'LeftHandIndex1',
  'mixamorigLeftHandIndex2': 'LeftHandIndex2',
  'mixamorigLeftHandIndex3': 'LeftHandIndex3',
  'mixamorigRightHandThumb1': 'RightHandThumb1',
  'mixamorigRightHandThumb2': 'RightHandThumb2',
  'mixamorigRightHandThumb3': 'RightHandThumb3',
  'mixamorigRightHandIndex1': 'RightHandIndex1',
  'mixamorigRightHandIndex2': 'RightHandIndex2',
  'mixamorigRightHandIndex3': 'RightHandIndex3'
};

export function retargetClip(
  clip: THREE.AnimationClip,
  avatarBones: THREE.Bone[]
): THREE.AnimationClip {
  console.log('🎯 Retargeting animation:', clip.name);
  
  // Create bone name lookup with RPM naming patterns
  const boneMap = new Map<string, THREE.Bone>();
  avatarBones.forEach(bone => {
    // Add various naming patterns
    const patterns = [
      bone.name,
      bone.name.toLowerCase(),
      bone.name.charAt(0).toLowerCase() + bone.name.slice(1), // camelCase
      bone.name.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1), // snake_case
    ];
    patterns.forEach(pattern => boneMap.set(pattern, bone));
  });

  console.log('🦴 Available avatar bones:', Array.from(boneMap.keys()).slice(0, 10), '...');

  const newTracks: THREE.KeyframeTrack[] = [];
  let rootMotionRemoved = 0;
  
  clip.tracks.forEach(track => {
    const trackName = track.name;
    const boneName = trackName.split('.')[0];
    const property = trackName.split('.')[1];
    
    // SKIP ROOT MOTION - Remove position tracks from Hips to prevent flying
    if (boneName === 'mixamorigHips' && property === 'position') {
      console.log('🚫 Removing root motion from Hips.position');
      rootMotionRemoved++;
      return; // Skip this track entirely
    }
    
    // Try to find matching bone
    let targetBone = null;
    let mappedName = '';
    
    // 1. Direct mapping from BONE_MAPPING
    if (BONE_MAPPING[boneName]) {
      const mappedBoneName = BONE_MAPPING[boneName];
      if (boneMap.has(mappedBoneName)) {
        targetBone = boneMap.get(mappedBoneName);
        mappedName = mappedBoneName;
      }
    }
    
    // 2. Try lowercase version of mapped name
    if (!targetBone && BONE_MAPPING[boneName]) {
      const lowercaseName = BONE_MAPPING[boneName].toLowerCase();
      if (boneMap.has(lowercaseName)) {
        targetBone = boneMap.get(lowercaseName);
        mappedName = lowercaseName;
      }
    }
    
    // 3. Fuzzy matching as last resort
    if (!targetBone) {
      const searchName = boneName.replace('mixamorig', '').toLowerCase();
      for (const [name, bone] of Array.from(boneMap.entries())) {
        if (name.toLowerCase().includes(searchName) || 
            searchName.includes(name.toLowerCase())) {
          targetBone = bone;
          mappedName = name;
          break;
        }
      }
    }
    
    if (targetBone) {
      const newTrackName = `${targetBone.name}.${property}`;
      const newTrack = track.clone();
      newTrack.name = newTrackName;
      newTracks.push(newTrack);
      console.log(`✅ ${boneName}.${property} -> ${targetBone.name}.${property}`);
    } else {
      console.warn(`❌ No bone found for: ${boneName}`);
    }
  });

  const retargetedClip = new THREE.AnimationClip(clip.name + '_inplace', clip.duration, newTracks);
  console.log(`🎵 Retargeted ${clip.tracks.length} -> ${newTracks.length} tracks (removed ${rootMotionRemoved} root motion tracks)`);
  
  return retargetedClip;
}

export function applyClip(
  mixer: THREE.AnimationMixer,
  avatarRoot: THREE.Object3D,
  clip: THREE.AnimationClip
): THREE.AnimationAction {
  // Get avatar bones
  let avatarBones: THREE.Bone[] = [];
  avatarRoot.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.skeleton) {
      avatarBones = child.skeleton.bones;
    }
  });

  // Retarget the clip if needed
  let finalClip = clip;
  if (clip.tracks.some(track => track.name.includes('mixamorig'))) {
    console.log('Mixamo animation detected, retargeting...');
    finalClip = retargetClip(clip, avatarBones);
  }

  // Create and return the action
  const action = mixer.clipAction(finalClip, avatarRoot);
  return action;
}

export const ANIMATION_NAMES = {
  IDLE: 'idle',
  // Dance animations - Using available FBX files
  BOOM_DANCE: 'Animation_Boom_Dance_withSkin',
  HIP_HOP_DANCE: 'Animation_Hip_Hop_Dance_withSkin',
  SHAKE_IT_OFF_DANCE: 'Animation_Shake_It_Off_Dance_withSkin',
  CRYSTAL_BEADS: 'Animation_Crystal_Beads_withSkin',
  MAGIC_GENIE: 'Animation_Magic_Genie_withSkin',
  OMG_GROOVE: 'Animation_OMG_Groove_withSkin'
} as const;

export type AnimationName = typeof ANIMATION_NAMES[keyof typeof ANIMATION_NAMES];
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the development server on localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code with Prettier

## Project Architecture

This is a 3D avatar dance lobby built with Next.js 14, Three.js, and React Three Fiber. The application features an interactive 3D character that can perform various dance animations synchronized with SoundCloud music tracks.

### Core Architecture Components

**Main Application (`app/page.tsx`)**
- Uses React Three Fiber Canvas for 3D rendering
- Manages application state (current animation, lighting presets, camera position)
- Orchestrates communication between UI and 3D components
- Configurable lighting presets and camera positions

**Avatar System (`components/Avatar.tsx`)**
- Loads Character_output.fbx as the main character model
- Manages 16+ dance animations from GLB files in `/public/biped/biped/`
- Implements animation crossfading with THREE.AnimationMixer
- Handles material processing for proper lighting response (converts MeshBasicMaterial to MeshStandardMaterial)
- Uses FBXLoader for character and GLTFLoader for animations

**Animation Management (`lib/animLoader.ts`)**
- Core animation loading utilities with GLTFLoader and FBXLoader
- Implements Mixamo to Ready Player Me bone retargeting
- Removes root motion from animations to prevent character flying
- Handles both GLB and FBX animation formats
- Exports ANIMATION_NAMES constant for type-safe animation references

**Dance Controller (`components/DanceController.tsx`)**
- Responsive UI for dance selection (grid on desktop, horizontal scroll on mobile)
- SoundCloud integration with 6 curated tracks from Aisu Idol
- Music-dance synchronization (music auto-plays/stops with dance selection)
- Tap-to-stop functionality (double-tap returns to idle pose)

**Scene Environment (`components/SceneEnv.tsx`)**
- Manages professional lighting setups with configurable presets
- Handles post-processing effects including bloom
- Environment setup for the 3D scene

**Party Stage (`components/PartyStage.tsx`)**
- Loads and positions stage elements (disco ball, speakers)
- Implements music-reactive animations (speakers vibrate when music plays)
- Manages 3D models from `/public/stages/party/`

### Key Technical Patterns

**Asset Management**
- Character model: Single FBX file at `/public/Character_output.fbx`
- Animations: Individual GLB files in `/public/biped/biped/Animation_*.glb`
- Stage elements: GLB models in `/public/stages/party/`

**Animation System**
- Uses THREE.AnimationMixer for smooth animation blending
- 300ms crossfade duration between animations
- Bone retargeting system for Mixamo compatibility
- Root motion removal to keep character in place

**State Management**
- Animation state flows from App → DanceController → Avatar
- Music state synchronized between DanceController and PartyStage
- Camera and lighting configurations managed at app level

**Responsive Design**
- Desktop: 6-column dance grid with full controls
- Mobile: Horizontal scrolling dance buttons, collapsible interface
- Universal SoundCloud player integration

### File Structure Notes

- All React components use 'use client' directive for Next.js App Router
- Three.js imports use 'three/addons/' pattern for loaders
- TypeScript with strict typing for animation names and props
- Tailwind CSS for styling with backdrop-blur effects

### Development Notes

- The application requires FBX and GLB animation files to be present in the public folder
- SoundCloud integration uses iframe embeds with autoplay
- Character positioning is precisely calibrated (scale: 0.010, position: [0, -0.046, 0])
- Material processing ensures proper PBR lighting response
- Animation loading is asynchronous with proper error handling
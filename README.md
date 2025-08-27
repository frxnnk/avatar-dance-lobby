# 🕺 Avatar Dance Lobby

A Fortnite-style avatar lobby built with Next.js and Three.js featuring a dancing avatar with SoundCloud music integration and professional lighting systems.

## ✨ Features

### 🎭 Avatar System
- **Character Model**: Custom FBX avatar with 16+ dance animations
- **Smooth Transitions**: Seamless animation blending and crossfading
- **Responsive Materials**: Dynamic lighting response with PBR materials

### 🎵 Music Integration
- **SoundCloud Integration**: Real tracks from Aisu Idol's official profile
- **Dance Synchronization**: Music automatically plays/stops with dance selection
- **6 Curated Tracks**: Each dance mapped to a specific song
- **Visual Feedback**: Speakers vibrate and pulse when music plays

### 🎪 Party Stage
- **Disco Ball**: Rotating mirror ball with realistic lighting
- **Dynamic Speakers**: Animated speakers that "pump" with the music
- **Professional Lighting**: 6 preset lighting configurations
- **Interactive Elements**: All stage elements respond to music state

### 🎮 Controls & UI
- **Responsive Design**: Optimized for both desktop and mobile
- **Collapsible Interface**: Clean, minimalist controls
- **6 Dance Moves**: Jazz, Pop, Groove, Boom, Crystal, and Funny dances
- **Tap-to-Toggle**: Double-tap to return to idle pose

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the avatar lobby.

## 📁 Project Structure

```
avatar-dance-lobby/
├── app/
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── Avatar.tsx         # Main avatar component with animations
│   ├── DanceController.tsx # Music player and dance selection UI
│   ├── PartyStage.tsx     # Stage elements (disco ball, speakers)
│   ├── SceneEnv.tsx       # Lighting and environment setup
│   └── SimpleDanceFloor.tsx # Animated dance floor
├── lib/
│   └── animLoader.ts      # Animation management utilities
└── public/
    ├── Character_output.fbx # Main character model
    ├── biped/biped/       # 16 dance animation files (.glb)
    └── stages/party/      # Party stage 3D models
        ├── disco-ball-with-colored-lights/
        ├── technival-speakers-wall/
        └── animated-dance-floor-neon-lights/
```

## 🎨 Available Animations

1. **Jazz Dance** → "Villain's Glow-Up" 🎷
2. **Pop Dance** → "Our Stage" 🎵
3. **You Groove** → "Echoes of Us" 🕺
4. **Boom Dance** → "Aisu's Anthem" 💥
5. **Crystal Beads** → "Late to Win" 💎
6. **Funny Dance** → "To the Meme and Back" 😂

## 🎭 Lighting Presets

- **🎪 Club Vibe**: High-energy club atmosphere
- **☀️ Warm Studio**: Soft, warm lighting for portraits  
- **❄️ Cool Blue**: Professional cool-toned setup
- **🌈 Neon Party**: Vibrant neon colors with bloom
- **🎭 Dramatic**: High contrast cinematic lighting
- **✨ Soft Light**: Gentle, even illumination

## 🔧 Key Components

### Avatar.tsx
- Loads and manages the main character FBX model
- Handles animation mixing and crossfading
- Processes materials for proper lighting response
- Implements 16+ dance animations from GLB files

### DanceController.tsx
- Responsive UI for dance selection
- SoundCloud music integration
- Collapsible interface for mobile
- Real-time music-dance synchronization

### PartyStage.tsx
- Manages disco ball rotation
- Implements speaker vibration when music plays
- Handles stage element positioning
- Creates immersive party atmosphere

## 🎵 Music Integration

The application uses SoundCloud's official embed player with tracks from **Aisu Idol**:
- Automatic play/pause with dance selection
- Volume control through SoundCloud interface
- Professional music-to-dance mapping
- Visual feedback through animated stage elements

## 📱 Responsive Design

- **Desktop**: Full 6-dance grid layout with complete controls
- **Mobile**: Horizontal scrolling dance buttons, collapsible UI
- **Universal**: Music player always visible, optimized touch targets

## 🌟 Performance Optimizations

- **Model Preloading**: 3D assets loaded asynchronously
- **Animation Caching**: Efficient animation clip management
- **Material Optimization**: PBR materials with proper lighting
- **Responsive Assets**: Optimized for various screen sizes

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **3D Engine**: Three.js with React Three Fiber
- **Styling**: Tailwind CSS
- **Audio**: SoundCloud Web Player
- **Animations**: FBX Loader with GLB animation files
- **Post-Processing**: @react-three/postprocessing

## 🎬 Future Enhancements

- Additional character models and customization
- More dance animations and music tracks
- Multiplayer lobby functionality
- Avatar customization options
- Social features and sharing

## 🚀 Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Avatar dance lobby with music integration"
   git remote add origin https://github.com/yourusername/avatar-dance-lobby.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com/)
   - Import your GitHub repository
   - Deploy automatically builds and deploys

3. **Environment Variables:** None needed - all client-side!

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🙏 Credits

- **Character Model**: Custom FBX avatar
- **Animations**: Professional dance motion capture
- **Music**: Aisu Idol official SoundCloud tracks
- **3D Models**: Various party stage elements
- **Lighting**: Professional preset configurations

## 📄 License

This project is for educational and demonstration purposes.

---

Built with ❤️ using Next.js, Three.js, and React Three Fiber
'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimationName, ANIMATION_NAMES } from '@/lib/animLoader';
import classNames from 'classnames';

interface DanceMove {
  id: AnimationName;
  name: string;
  emoji: string;
  category: 'basic' | 'latin' | 'modern' | 'freestyle';
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  gradient: string;
  isAvailable: boolean;
}

interface DanceControllerProps {
  currentAnimation: AnimationName;
  onAnimationChange: (animation: AnimationName) => void;
  onMusicStateChange: (isPlaying: boolean) => void;
}

// SoundCloud Widget API types
declare global {
  interface Window {
    SC: {
      Widget: (iframe: HTMLIFrameElement) => {
        bind: (event: string, callback: Function) => void;
        setVolume: (volume: number) => void;
        getVolume: (callback: (volume: number) => void) => void;
        load: (url: string, options?: any) => void;
        play: () => void;
        pause: () => void;
      };
    };
  }
}

export default function DanceController({ currentAnimation, onAnimationChange, onMusicStateChange }: DanceControllerProps) {
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationName | null>(null);
  const [isPlayingSelected, setIsPlayingSelected] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(15); // Start with very low volume
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const widgetRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize SoundCloud Widget when iframe loads
  useEffect(() => {
    if (isPlayingSelected && iframeRef.current) {
      // Reset widget reference when track changes
      widgetRef.current = null;
      
      const timer = setTimeout(() => {
        if (window.SC && iframeRef.current) {
          widgetRef.current = window.SC.Widget(iframeRef.current);
          console.log(`🎵 Initializing widget for track ${currentTrackIndex}`);
          
          widgetRef.current.bind('ready', () => {
            // Set initial volume when widget is ready
            try {
              widgetRef.current.setVolume(volume);
              console.log(`🔊 Volume set to ${volume}%`);
            } catch (error) {
              console.log('Error setting initial volume:', error);
            }
            
            // Listen for when music actually starts playing
            widgetRef.current.bind('play', () => {
              console.log('🎵 SoundCloud started playing - starting dance animation');
              setIsMusicPlaying(true);
            });
            
            // Listen for when music pauses/stops
            widgetRef.current.bind('pause', () => {
              console.log('⏸️ SoundCloud paused - stopping dance animation');
              setIsMusicPlaying(false);
            });
            
            // Listen for when music finishes
            widgetRef.current.bind('finish', () => {
              console.log('🏁 SoundCloud finished - stopping dance animation');
              setIsMusicPlaying(false);
            });
          });
        }
      }, 1500); // Increased timeout for better reliability
      
      return () => clearTimeout(timer);
    }
  }, [isPlayingSelected, currentTrackIndex, volume]);

  // Update volume when volume state changes
  useEffect(() => {
    if (widgetRef.current && isPlayingSelected && typeof widgetRef.current.setVolume === 'function') {
      try {
        widgetRef.current.setVolume(volume);
      } catch (error) {
        console.log('Volume control not ready yet, will retry when widget is initialized');
      }
    }
  }, [volume, isPlayingSelected]);

  // Complete SoundCloud tracks from Aisu Idol (all 10 tracks) - Optimized to minimize overlays
  const soundcloudTracks = [
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/the-rise-is-ours&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "The Rise is Ours" (2025-01-08)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/close-to-none&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "Close to None" (2025-01-06)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/two-roads&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "Two Roads" (2025-01-06)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/two-voices&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "Two Voices" (2025-01-05)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/to-the-meme-and-back&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "To the Meme and Back" (2025-01-04)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/late-to-win&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "Late to Win" (2025-01-03)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/aisus-anthem&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "Aisu's Anthem" (2024-12-31)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/our-stage&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "Our Stage" (2024-12-24)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/echoes-of-us&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false', // "Echoes of Us" (2024-12-22)
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/villains-glow-up&color=%23ff5500&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=true&show_playcount=false&show_bpm=false'  // "Villain's Glow-Up" (2024-12-19)
  ];

  // Available dance moves (excluding All Night Dance and Idle poses - they are special)
  const danceMoves: DanceMove[] = [
    {
      id: ANIMATION_NAMES.JAZZ_DANCE,
      name: 'Jazz Dance',
      emoji: '🎷',
      category: 'latin',
      difficulty: 4,
      description: 'Smooth jazz dance with style',
      gradient: 'from-orange-500 to-red-500',
      isAvailable: true
    },
    {
      id: ANIMATION_NAMES.POP_DANCE,
      name: 'Pop Dance',
      emoji: '🎵',
      category: 'modern',
      difficulty: 4,
      description: 'Energetic pop dance moves',
      gradient: 'from-red-500 to-pink-500',
      isAvailable: true
    },
    {
      id: ANIMATION_NAMES.YOU_GROOVE,
      name: 'You Groove',
      emoji: '🕺',
      category: 'freestyle',
      difficulty: 3,
      description: 'Funky groove moves',
      gradient: 'from-purple-500 to-blue-500',
      isAvailable: true
    },
    {
      id: ANIMATION_NAMES.BOOM_DANCE,
      name: 'Boom Dance',
      emoji: '💥',
      category: 'modern',
      difficulty: 4,
      description: 'Explosive dance moves',
      gradient: 'from-yellow-500 to-orange-500',
      isAvailable: true
    },
    {
      id: ANIMATION_NAMES.CRYSTAL_BEADS,
      name: 'Crystal Beads',
      emoji: '💎',
      category: 'freestyle',
      difficulty: 5,
      description: 'Elegant crystal-inspired moves',
      gradient: 'from-cyan-500 to-blue-500',
      isAvailable: true
    },
    {
      id: ANIMATION_NAMES.FUNNY_DANCING,
      name: 'Funny Dance',
      emoji: '😂',
      category: 'freestyle',
      difficulty: 2,
      description: 'Hilarious comedy dance',
      gradient: 'from-green-500 to-teal-500',
      isAvailable: true
    }
  ];

  const handleDanceSelect = (danceId: AnimationName) => {
    if (selectedAnimation === danceId && isPlayingSelected) {
      // Second tap - go back to Idle pose and stop music
      onAnimationChange(ANIMATION_NAMES.IDLE_4);
      setIsPlayingSelected(false);
      setIsMusicPlaying(false);
    } else {
      // First tap or switching between dances
      const danceIndex = danceMoves.findIndex(move => move.id === danceId);
      if (danceIndex !== -1) {
        // Set new track and dance immediately
        setCurrentTrackIndex(danceIndex);
        setSelectedAnimation(danceId);
        setIsPlayingSelected(true);
        
        // Start in idle, will switch to dance when music plays
        onAnimationChange(ANIMATION_NAMES.IDLE_4);
        setIsMusicPlaying(false);
      }
    }
  };

  // Track when we're in idle mode
  useEffect(() => {
    if (currentAnimation === ANIMATION_NAMES.IDLE_4 || currentAnimation === ANIMATION_NAMES.IDLE_9) {
      setIsPlayingSelected(false);
      setIsMusicPlaying(false);
    }
  }, [currentAnimation]);

  // Sync dance with music state - start dancing when music plays, idle when stops
  useEffect(() => {
    if (isPlayingSelected && selectedAnimation) {
      if (isMusicPlaying) {
        // Music started playing - begin dance animation
        onAnimationChange(selectedAnimation);
      } else {
        // Music stopped - go to idle pose
        onAnimationChange(ANIMATION_NAMES.IDLE_4);
      }
    }
  }, [isMusicPlaying, isPlayingSelected, selectedAnimation, onAnimationChange]);

  // Notify parent about music state changes
  useEffect(() => {
    onMusicStateChange(isMusicPlaying && isPlayingSelected);
  }, [isMusicPlaying, isPlayingSelected, onMusicStateChange]);

  const categories = {
    basic: { name: 'Basic', icon: '⚪', color: 'text-gray-300' },
    latin: { name: 'Latin', icon: '🌶️', color: 'text-red-400' },
    modern: { name: 'Modern', icon: '🎵', color: 'text-purple-400' },
    freestyle: { name: 'Freestyle', icon: '⚡', color: 'text-blue-400' }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const groupedMoves = danceMoves.reduce((groups, move) => {
    if (!groups[move.category]) {
      groups[move.category] = [];
    }
    groups[move.category].push(move);
    return groups;
  }, {} as Record<string, DanceMove[]>);

  return (
    <div className="fixed bottom-2 md:bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl md:max-w-xl md:w-full">
      {/* Collapse Toggle - All screen sizes */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
        <h2 className="text-sm font-medium text-white/90 tracking-wide">
          🎵 DANCE CONTROL
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <span className="text-lg">{isCollapsed ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* SoundCloud Player - Always visible */}
      <div className="p-2 md:p-3 pb-1 md:pb-2">
        <div className="bg-white/5 rounded-xl p-2 md:p-3 border border-white/10">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs">♪</span>
            </div>
            <p className="text-white font-medium text-xs md:text-sm">SoundCloud Player</p>
            {isPlayingSelected && (
              <span className="text-green-400 text-xs">🎵 Playing</span>
            )}
            {isPlayingSelected && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                  className="text-white/70 hover:text-white text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  🔊 {volume}%
                </button>
              </div>
            )}
          </div>
          
          {/* Volume Control Slider */}
          {showVolumeControl && isPlayingSelected && (
            <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-xs">🔇</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-white/70 text-xs">🔊</span>
                <span className="text-white text-xs font-mono w-8">{volume}%</span>
              </div>
            </div>
          )}

          {isPlayingSelected && selectedAnimation ? (
            <iframe
              ref={iframeRef}
              key={`sc-${currentTrackIndex}`}
              id="soundcloud-player"
              src={`${soundcloudTracks[currentTrackIndex] || soundcloudTracks[0]}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&show_teaser=false&buying=false&download=false&sharing=false&liking=false`}
              width="100%"
              height="166"
              frameBorder="0"
              allow="autoplay"
              className="rounded-lg h-[150px] md:h-[166px]"
              style={{
                filter: 'contrast(1.1) saturate(1.1)',
                border: 'none',
                outline: 'none'
              }}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              onLoad={() => {
                // Widget initialization will handle music state
              }}
            ></iframe>
          ) : (
            <div className="h-[150px] md:h-[166px] bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
              <p className="text-white/50 text-xs md:text-sm">🎵 Select a dance to play music</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'h-0 overflow-hidden' : 'p-2 md:p-3 pt-0'}`}>
        {/* Mobile: Clean Dance Buttons */}
        <div className="md:hidden mb-2">
            <div className="flex gap-1.5 overflow-x-auto pb-2">
            {danceMoves.filter(move => move.isAvailable).map((move) => (
              <button
                key={move.id}
                onClick={() => handleDanceSelect(move.id)}
                className={classNames(
                  'flex-shrink-0 px-3 py-2 rounded-lg font-medium text-xs',
                  'transition-all duration-200 border min-w-[75px]',
                  {
                    'bg-white/15 border-white/30 text-white': selectedAnimation === move.id && isPlayingSelected,
                    'bg-white/5 border-white/10 text-white/80 hover:bg-white/10': !(selectedAnimation === move.id && isPlayingSelected),
                  }
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs opacity-60">{move.emoji}</span>
                  <span className="text-[10px] font-medium">{move.name}</span>
                  {selectedAnimation === move.id && isPlayingSelected && (
                    <span className="text-[7px] text-white/50 font-mono">TAP TO STOP</span>
                  )}
                </div>
              </button>
            ))}
            </div>
          </div>

        {/* Desktop: Compact Dance Grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-3 gap-2">
            {danceMoves.map((move) => (
              <button
                key={move.id}
                onClick={() => move.isAvailable && handleDanceSelect(move.id)}
                disabled={!move.isAvailable}
                className={classNames(
                  'p-3 rounded-lg text-center transition-all duration-200 border',
                  'hover:scale-105 active:scale-95',
                  {
                    'bg-white/15 border-white/30 text-white shadow-lg': 
                      move.isAvailable && selectedAnimation === move.id && isPlayingSelected,
                    'bg-white/5 border-white/10 text-white/80 hover:bg-white/10': 
                      move.isAvailable && !(selectedAnimation === move.id && isPlayingSelected),
                    'bg-white/5 border-white/5 text-white/40 cursor-not-allowed hover:scale-100': 
                      !move.isAvailable
                  }
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm opacity-70">{move.emoji}</span>
                  <span className="text-xs font-medium">{move.name}</span>
                  {selectedAnimation === move.id && isPlayingSelected && (
                    <span className="text-[8px] text-white/50 font-mono">TAP TO STOP</span>
                  )}
                  {!move.isAvailable && (
                    <span className="text-[10px] text-white/30 font-mono">SOON</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Clean Footer */}
        <div className="text-center mt-2 md:mt-3 text-white/30 text-xs hidden md:block font-mono">
          DRAG TO ROTATE • SCROLL TO ZOOM
        </div>
      </div>
    </div>
  );
}
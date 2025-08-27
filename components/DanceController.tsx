'use client';

import { useState, useEffect } from 'react';
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

export default function DanceController({ currentAnimation, onAnimationChange, onMusicStateChange }: DanceControllerProps) {
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationName | null>(null);
  const [isPlayingSelected, setIsPlayingSelected] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // SoundCloud tracks from Aisu Idol corresponding to each dance
  const soundcloudTracks = [
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/villains-glow-up&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false&show_artwork=true&show_playcount=true&show_bpm=false', // Jazz Dance - "Villain's Glow-Up"
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/our-stage&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false&show_artwork=true&show_playcount=true&show_bpm=false', // Pop Dance - "Our Stage"
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/echoes-of-us&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false&show_artwork=true&show_playcount=true&show_bpm=false', // You Groove - "Echoes of Us"
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/aisus-anthem&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false&show_artwork=true&show_playcount=true&show_bpm=false', // Boom Dance - "Aisu's Anthem"
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/late-to-win&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false&show_artwork=true&show_playcount=true&show_bpm=false', // Crystal Beads - "Late to Win"
    'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/aisu-idol/to-the-meme-and-back&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=false&show_artwork=true&show_playcount=true&show_bpm=false'  // Funny Dancing - "To the Meme and Back"
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
      // First tap - play selected animation and change music
      const danceIndex = danceMoves.findIndex(move => move.id === danceId);
      if (danceIndex !== -1) {
        setCurrentTrackIndex(danceIndex);
      }
      setSelectedAnimation(danceId);
      // Only start dancing if music will be playing
      onAnimationChange(danceId);
      setIsPlayingSelected(true);
      setIsMusicPlaying(true);
    }
  };

  // Track when we're in idle mode
  useEffect(() => {
    if (currentAnimation === ANIMATION_NAMES.IDLE_4 || currentAnimation === ANIMATION_NAMES.IDLE_9) {
      setIsPlayingSelected(false);
      setIsMusicPlaying(false);
    }
  }, [currentAnimation]);

  // Sync dance with music state - if music stops, go to idle
  useEffect(() => {
    if (isPlayingSelected && !isMusicPlaying) {
      onAnimationChange(ANIMATION_NAMES.IDLE_4);
      setIsPlayingSelected(false);
    }
  }, [isMusicPlaying, isPlayingSelected, onAnimationChange]);

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
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10">
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

      {/* Spotify Player - Always visible */}
      <div className="max-w-4xl mx-auto p-4 pb-2">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs">♪</span>
            </div>
            <p className="text-white font-medium text-sm">SoundCloud Player</p>
            {isPlayingSelected && (
              <span className="text-green-400 text-xs">🎵 Playing</span>
            )}
            {isPlayingSelected && (
              <span className="text-white/50 text-xs ml-auto">Volume in player</span>
            )}
          </div>
          {isPlayingSelected && selectedAnimation ? (
            <iframe
              key={currentTrackIndex}
              id="soundcloud-player"
              src={`${soundcloudTracks[currentTrackIndex] || soundcloudTracks[0]}&auto_play=true`}
              width="100%"
              height="166"
              frameBorder="0"
              allow="autoplay"
              className="rounded-lg"
              onLoad={() => {
                setIsMusicPlaying(true);
              }}
            ></iframe>
          ) : (
            <div className="h-[166px] bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
              <p className="text-white/50 text-sm">🎵 Select a dance to play music</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`max-w-4xl mx-auto transition-all duration-300 ${isCollapsed ? 'h-0 overflow-hidden' : 'p-4 pt-0'}`}>
        {/* Mobile: Clean Dance Buttons */}
        <div className="md:hidden mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
            {danceMoves.filter(move => move.isAvailable).map((move) => (
              <button
                key={move.id}
                onClick={() => handleDanceSelect(move.id)}
                className={classNames(
                  'flex-shrink-0 px-4 py-3 rounded-xl font-medium text-sm',
                  'transition-all duration-200 border min-w-[90px]',
                  {
                    'bg-white/15 border-white/30 text-white': selectedAnimation === move.id && isPlayingSelected,
                    'bg-white/5 border-white/10 text-white/80 hover:bg-white/10': !(selectedAnimation === move.id && isPlayingSelected),
                  }
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm opacity-60">{move.emoji}</span>
                  <span className="text-xs font-medium">{move.name}</span>
                  {selectedAnimation === move.id && isPlayingSelected && (
                    <span className="text-[8px] text-white/50 font-mono">TAP TO STOP</span>
                  )}
                </div>
              </button>
            ))}
            </div>
          </div>

        {/* Desktop: Minimalist Dance Grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-6 gap-2">
            {danceMoves.map((move) => (
              <button
                key={move.id}
                onClick={() => move.isAvailable && handleDanceSelect(move.id)}
                disabled={!move.isAvailable}
                className={classNames(
                  'p-4 rounded-xl text-center transition-all duration-200 border',
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
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg opacity-70">{move.emoji}</span>
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
        <div className="text-center mt-4 text-white/30 text-xs hidden md:block font-mono">
          DRAG TO ROTATE • SCROLL TO ZOOM
        </div>
      </div>
    </div>
  );
}
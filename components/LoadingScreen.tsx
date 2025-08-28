'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
  currentTask?: string;
}

export default function LoadingScreen({ isLoading, progress = 0, currentTask = 'Cargando...' }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      
      {/* Loading content */}
      <div className="relative z-10 text-center">
        {/* Avatar icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto relative">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-spin" 
                 style={{ animationDuration: '3s' }} />
            {/* Inner ring */}
            <div className="absolute inset-2 border-4 border-blue-500/50 rounded-full animate-spin" 
                 style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            {/* Center avatar */}
            <div className="absolute inset-4 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🕺</span>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Aisu Dance Lobby
        </h1>
        
        <p className="text-xl text-purple-300 mb-8">
          {currentTask}{dots}
        </p>

        {/* Progress bar */}
        <div className="w-80 mx-auto mb-6">
          <div className="bg-gray-800/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(progress, 10)}%` }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-400">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading stages */}
        <div className="text-sm text-gray-500 space-y-1">
          <div className={`transition-colors ${progress > 10 ? 'text-green-400' : 'text-gray-500'}`}>
            ✓ Initializing dance system
          </div>
          <div className={`transition-colors ${progress > 30 ? 'text-green-400' : 'text-gray-500'}`}>
            ✓ Loading 3D avatar
          </div>
          <div className={`transition-colors ${progress > 70 ? 'text-green-400' : 'text-gray-500'}`}>
            ✓ Preparing dance animations
          </div>
          <div className={`transition-colors ${progress > 90 ? 'text-green-400' : 'text-gray-500'}`}>
            ✓ Setting up dance floor
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
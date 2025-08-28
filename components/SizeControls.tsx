'use client';

import { useState } from 'react';

interface SizeSettings {
  danceFloor: {
    gridSize: number;
    squareSize: number;
    spacing: number;
  };
  objects: {
    discoBallScale: number;
    speakerScale: number;
  };
}

interface SizeControlsProps {
  settings: SizeSettings;
  onSettingsChange: (settings: SizeSettings) => void;
}

export default function SizeControls({ settings, onSettingsChange }: SizeControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDanceFloorChange = (key: keyof SizeSettings['danceFloor'], value: number) => {
    const newSettings = {
      ...settings,
      danceFloor: {
        ...settings.danceFloor,
        [key]: value
      }
    };
    onSettingsChange(newSettings);
  };

  const handleObjectChange = (key: keyof SizeSettings['objects'], value: number) => {
    const newSettings = {
      ...settings,
      objects: {
        ...settings.objects,
        [key]: value
      }
    };
    onSettingsChange(newSettings);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
          isOpen 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        📏 Tamaños
      </button>

      {/* Size Control Panel */}
      <div className={`fixed top-16 left-4 z-40 bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'
      }`}>
        <h3 className="text-white font-bold text-lg mb-4">🎛️ Control de Tamaños</h3>
        
        {/* Dance Floor Controls */}
        <div className="mb-6">
          <h4 className="text-purple-300 font-semibold mb-3">🕺 Pista de Baile</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Tamaño de cuadrícula: {settings.danceFloor.gridSize}x{settings.danceFloor.gridSize}
              </label>
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={settings.danceFloor.gridSize}
                onChange={(e) => handleDanceFloorChange('gridSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Tamaño de panel: {settings.danceFloor.squareSize.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.danceFloor.squareSize}
                onChange={(e) => handleDanceFloorChange('squareSize', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Espaciado: {settings.danceFloor.spacing.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={settings.danceFloor.spacing}
                onChange={(e) => handleDanceFloorChange('spacing', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Objects Controls */}
        <div className="mb-4">
          <h4 className="text-purple-300 font-semibold mb-3">🎉 Objetos de Escena</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Bola de disco: {settings.objects.discoBallScale.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={settings.objects.discoBallScale}
                onChange={(e) => handleObjectChange('discoBallScale', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Altavoces: {settings.objects.speakerScale.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={settings.objects.speakerScale}
                onChange={(e) => handleObjectChange('speakerScale', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => onSettingsChange({
            danceFloor: { gridSize: 20, squareSize: 0.5, spacing: 0.05 },
            objects: { discoBallScale: 0.6, speakerScale: 0.5 }
          })}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors"
        >
          🔄 Restablecer
        </button>
      </div>

      {/* Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #6d28d9;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #6d28d9;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        
        .slider::-webkit-slider-track {
          background: #374151;
          border-radius: 5px;
        }
        
        .slider::-moz-range-track {
          background: #374151;
          border-radius: 5px;
        }
      `}</style>
    </>
  );
}

export type { SizeSettings };
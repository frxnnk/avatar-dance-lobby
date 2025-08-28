'use client';

import { useState } from 'react';

interface ModelPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

interface PositionControlsProps {
  position: ModelPosition;
  onPositionChange: (position: ModelPosition) => void;
}

export default function PositionControls({ position, onPositionChange }: PositionControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (key: keyof ModelPosition, value: number) => {
    onPositionChange({
      ...position,
      [key]: value
    });
  };

  const resetPosition = () => {
    onPositionChange({
      x: 0,
      y: 0,
      z: 0,
      scale: 0.015,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  };

  return (
    <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[280px] max-w-[320px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-medium text-sm">🎮 Model Position</h3>
        <div className="flex gap-2">
          <button
            onClick={resetPosition}
            className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded border border-red-500/30 hover:bg-red-500/30 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Controls */}
      {!isCollapsed && (
        <div className="space-y-3">
          {/* Position Controls */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-white/60 block mb-1">X: {position.x.toFixed(2)}</label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={position.x}
                onChange={(e) => handleChange('x', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Y: {position.y.toFixed(2)}</label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={position.y}
                onChange={(e) => handleChange('y', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Z: {position.z.toFixed(2)}</label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={position.z}
                onChange={(e) => handleChange('z', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>
          </div>

          {/* Scale Control */}
          <div>
            <label className="text-xs text-white/60 block mb-1">Scale: {position.scale.toFixed(3)}</label>
            <input
              type="range"
              min="0.001"
              max="5"
              step="0.01"
              value={position.scale}
              onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
            />
          </div>

          {/* Rotation Controls */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-white/60 block mb-1">Rot X: {(position.rotationX * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-3.14159"
                max="3.14159"
                step="0.1"
                value={position.rotationX}
                onChange={(e) => handleChange('rotationX', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Rot Y: {(position.rotationY * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-3.14159"
                max="3.14159"
                step="0.1"
                value={position.rotationY}
                onChange={(e) => handleChange('rotationY', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Rot Z: {(position.rotationZ * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="-3.14159"
                max="3.14159"
                step="0.1"
                value={position.rotationZ}
                onChange={(e) => handleChange('rotationZ', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>
          </div>

          {/* Quick Position Presets */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => onPositionChange({ ...position, x: 0, y: 0, z: 0 })}
              className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              Center
            </button>
            <button
              onClick={() => onPositionChange({ ...position, y: -2 })}
              className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 transition-colors"
            >
              Floor
            </button>
            <button
              onClick={() => onPositionChange({ ...position, scale: 0.01 })}
              className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
            >
              Mini (0.01)
            </button>
            <button
              onClick={() => onPositionChange({ ...position, scale: 0.1 })}
              className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
            >
              Small (0.1)
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  );
}
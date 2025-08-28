'use client';

import { useState } from 'react';
import { SpeakerConfig, ElementPosition } from './PartyStage';

interface ConfigState {
  discoBall: ElementPosition;
  speakers: SpeakerConfig[];
  danceFloor: {
    gridSize: number;
    squareSize: number;
    spacing: number;
  };
}

interface PositionControlsProps {
  config: ConfigState;
  onConfigChange: (config: ConfigState) => void;
  onSaveConfiguration: (config: ConfigState) => void;
}

export default function PositionControls({ config, onConfigChange, onSaveConfiguration }: PositionControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'discoBall' | 'speakers' | 'danceFloor' | 'save'>('speakers');

  const updateDiscoBall = (key: keyof ElementPosition, value: number) => {
    const newConfig = {
      ...config,
      discoBall: {
        ...config.discoBall,
        [key]: value
      }
    };
    onConfigChange(newConfig);
  };

  const updateSpeaker = (speakerId: string, key: keyof ElementPosition, value: number) => {
    const newConfig = {
      ...config,
      speakers: config.speakers.map(speaker => 
        speaker.id === speakerId 
          ? { ...speaker, position: { ...speaker.position, [key]: value } }
          : speaker
      )
    };
    onConfigChange(newConfig);
  };

  const toggleSpeaker = (speakerId: string) => {
    const newConfig = {
      ...config,
      speakers: config.speakers.map(speaker => 
        speaker.id === speakerId 
          ? { ...speaker, enabled: !speaker.enabled }
          : speaker
      )
    };
    onConfigChange(newConfig);
  };

  const updateDanceFloor = (key: keyof ConfigState['danceFloor'], value: number) => {
    const newConfig = {
      ...config,
      danceFloor: {
        ...config.danceFloor,
        [key]: value
      }
    };
    onConfigChange(newConfig);
  };

  const resetConfiguration = () => {
    const defaultConfig: ConfigState = {
      discoBall: { x: 0.00, y: 2.40, z: -2.00, rotationY: 0.000, scale: 0.60 },
      speakers: [
        { id: 'speaker1', position: { x: -3.0, y: -0.10, z: -6.80, rotationY: 0.5, scale: 0.50 }, enabled: true },
        { id: 'speaker2', position: { x: 3.0, y: -0.10, z: -6.80, rotationY: -0.5, scale: 0.50 }, enabled: true },
        { id: 'speaker3', position: { x: -4.5, y: -0.10, z: 0, rotationY: 1.57, scale: 0.40 }, enabled: false },
        { id: 'speaker4', position: { x: 4.5, y: -0.10, z: 0, rotationY: -1.57, scale: 0.40 }, enabled: false }
      ],
      danceFloor: { gridSize: 20, squareSize: 0.5, spacing: 0.05 }
    };
    onConfigChange(defaultConfig);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
          isOpen 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        🎛️ Configurar Escena
      </button>

      {/* Position Control Panel */}
      <div className={`fixed top-16 right-4 z-40 w-80 bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('speakers')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'speakers' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔊 Altavoces
          </button>
          <button
            onClick={() => setActiveTab('discoBall')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'discoBall' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🪩 Disco
          </button>
          <button
            onClick={() => setActiveTab('danceFloor')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'danceFloor' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🕺 Pista
          </button>
          <button
            onClick={() => setActiveTab('save')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'save' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            💾 Guardar
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          
          {/* Speakers Tab */}
          {activeTab === 'speakers' && (
            <div>
              <h4 className="text-blue-300 font-semibold mb-3">🔊 Control de Altavoces</h4>
              
              {config.speakers.map((speaker, index) => (
                <div key={speaker.id} className="mb-4 p-3 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Altavoz {index + 1}</span>
                    <button
                      onClick={() => toggleSpeaker(speaker.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        speaker.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {speaker.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  
                  {speaker.enabled && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          X: {speaker.position.x.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-8"
                          max="8"
                          step="0.1"
                          value={speaker.position.x}
                          onChange={(e) => updateSpeaker(speaker.id, 'x', parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Y: {speaker.position.y.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-2"
                          max="3"
                          step="0.1"
                          value={speaker.position.y}
                          onChange={(e) => updateSpeaker(speaker.id, 'y', parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Z: {speaker.position.z.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-10"
                          max="5"
                          step="0.1"
                          value={speaker.position.z}
                          onChange={(e) => updateSpeaker(speaker.id, 'z', parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          Rotación: {(speaker.position.rotationY * 180 / Math.PI).toFixed(0)}°
                        </label>
                        <input
                          type="range"
                          min={-Math.PI}
                          max={Math.PI}
                          step="0.1"
                          value={speaker.position.rotationY}
                          onChange={(e) => updateSpeaker(speaker.id, 'rotationY', parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Disco Ball Tab */}
          {activeTab === 'discoBall' && (
            <div>
              <h4 className="text-blue-300 font-semibold mb-3">🪩 Bola de Disco</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    X: {config.discoBall.x.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={config.discoBall.x}
                    onChange={(e) => updateDiscoBall('x', parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Y: {config.discoBall.y.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={config.discoBall.y}
                    onChange={(e) => updateDiscoBall('y', parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Z: {config.discoBall.z.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="-8"
                    max="2"
                    step="0.1"
                    value={config.discoBall.z}
                    onChange={(e) => updateDiscoBall('z', parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Tamaño: {config.discoBall.scale.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="2"
                    step="0.1"
                    value={config.discoBall.scale}
                    onChange={(e) => updateDiscoBall('scale', parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dance Floor Tab */}
          {activeTab === 'danceFloor' && (
            <div>
              <h4 className="text-blue-300 font-semibold mb-3">🕺 Pista de Baile</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Cuadrícula: {config.danceFloor.gridSize}x{config.danceFloor.gridSize}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="1"
                    value={config.danceFloor.gridSize}
                    onChange={(e) => updateDanceFloor('gridSize', parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Tamaño de panel: {config.danceFloor.squareSize.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={config.danceFloor.squareSize}
                    onChange={(e) => updateDanceFloor('squareSize', parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Espaciado: {config.danceFloor.spacing.toFixed(3)}
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.2"
                    step="0.01"
                    value={config.danceFloor.spacing}
                    onChange={(e) => updateDanceFloor('spacing', parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Tab */}
          {activeTab === 'save' && (
            <div>
              <h4 className="text-green-300 font-semibold mb-3">💾 Guardar Configuración</h4>
              
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Cuando estés satisfecho con la configuración actual, puedes guardarla como la configuración por defecto.
                </p>
                
                <button
                  onClick={() => onSaveConfiguration(config)}
                  className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  ✅ Guardar como Configuración Final
                </button>
                
                <button
                  onClick={resetConfiguration}
                  className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  🔄 Restablecer Todo
                </button>
                
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <h5 className="text-gray-300 font-semibold mb-2">📋 Configuración Actual:</h5>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>🪩 Disco: ({config.discoBall.x.toFixed(1)}, {config.discoBall.y.toFixed(1)}, {config.discoBall.z.toFixed(1)})</div>
                    <div>🕺 Pista: {config.danceFloor.gridSize}x{config.danceFloor.gridSize}</div>
                    <div>🔊 Altavoces activos: {config.speakers.filter(s => s.enabled).length}/{config.speakers.length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export type { ConfigState };
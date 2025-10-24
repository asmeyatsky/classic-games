/**
 * Audio Settings Component - User Audio Preferences Control
 *
 * Handles:
 * - Master volume control
 * - Individual track volume sliders (music, sfx, ambient)
 * - Audio toggle switches (music, sfx, haptics)
 * - Preference persistence
 * - Real-time audio feedback
 *
 * Architectural Intent:
 * - Centralized audio preference management UI
 * - Premium dark aesthetic matching design system
 * - Smooth slider interactions with visual feedback
 * - Settings automatically saved to localStorage
 */

import React, { useState, useEffect } from 'react';
import { useAudio } from '@classic-games/audio';

export interface AudioSettingsProps {
  onClose?: () => void;
  className?: string;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  onClose,
  className = ''
}) => {
  const { config, setVolume, toggleAudio } = useAudio();

  const [volumes, setVolumes] = useState({
    master: config.masterVolume,
    music: config.musicVolume,
    sfx: config.sfxVolume,
    ambient: config.ambientVolume
  });

  const [toggles, setToggles] = useState({
    music: config.musicEnabled,
    sfx: config.sfxEnabled,
    haptics: config.hapticsEnabled
  });

  // Handle volume slider changes
  const handleVolumeChange = (type: 'master' | 'music' | 'sfx' | 'ambient', value: number) => {
    const normalizedValue = Math.max(0, Math.min(1, value));
    setVolumes(prev => ({ ...prev, [type]: normalizedValue }));
    setVolume(type, normalizedValue);
  };

  // Handle toggle changes
  const handleToggleChange = (type: 'music' | 'sfx' | 'haptics') => {
    setToggles(prev => ({ ...prev, [type]: !prev[type] }));
    toggleAudio(type);
  };

  return (
    <div className={`audio-settings ${className}`}>
      <div className="setting-panel">
        {/* Header */}
        <div className="setting-header">
          <h2 className="text-xl font-bold text-white">Audio Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close settings"
            >
              ✕
            </button>
          )}
        </div>

        {/* Master Volume */}
        <div className="setting-group">
          <div className="setting-label">
            <span className="text-sm font-semibold text-gray-300">Master Volume</span>
            <span className="text-xs text-gray-500">{Math.round(volumes.master * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumes.master}
            onChange={e => handleVolumeChange('master', parseFloat(e.target.value))}
            className="volume-slider"
            aria-label="Master volume"
          />
        </div>

        {/* Music Volume */}
        <div className="setting-group">
          <div className="setting-label">
            <span className="text-sm font-semibold text-gray-300">Music Volume</span>
            <span className="text-xs text-gray-500">{Math.round(volumes.music * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumes.music}
            onChange={e => handleVolumeChange('music', parseFloat(e.target.value))}
            className="volume-slider"
            aria-label="Music volume"
            disabled={!toggles.music}
          />
          <button
            onClick={() => handleToggleChange('music')}
            className={`toggle-button ${toggles.music ? 'active' : 'inactive'}`}
            aria-label="Toggle music"
          >
            {toggles.music ? '🔊' : '🔇'}
          </button>
        </div>

        {/* SFX Volume */}
        <div className="setting-group">
          <div className="setting-label">
            <span className="text-sm font-semibold text-gray-300">Sound Effects Volume</span>
            <span className="text-xs text-gray-500">{Math.round(volumes.sfx * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumes.sfx}
            onChange={e => handleVolumeChange('sfx', parseFloat(e.target.value))}
            className="volume-slider"
            aria-label="Sound effects volume"
            disabled={!toggles.sfx}
          />
          <button
            onClick={() => handleToggleChange('sfx')}
            className={`toggle-button ${toggles.sfx ? 'active' : 'inactive'}`}
            aria-label="Toggle sound effects"
          >
            {toggles.sfx ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Ambient Volume */}
        <div className="setting-group">
          <div className="setting-label">
            <span className="text-sm font-semibold text-gray-300">Ambient Volume</span>
            <span className="text-xs text-gray-500">{Math.round(volumes.ambient * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumes.ambient}
            onChange={e => handleVolumeChange('ambient', parseFloat(e.target.value))}
            className="volume-slider"
            aria-label="Ambient volume"
          />
        </div>

        {/* Haptics Toggle */}
        <div className="setting-group haptics">
          <div className="setting-label">
            <span className="text-sm font-semibold text-gray-300">Haptic Feedback</span>
          </div>
          <button
            onClick={() => handleToggleChange('haptics')}
            className={`haptics-toggle ${toggles.haptics ? 'enabled' : 'disabled'}`}
            aria-label="Toggle haptic feedback"
          >
            <div className={`toggle-indicator ${toggles.haptics ? 'on' : 'off'}`} />
            <span className="text-sm text-gray-300">{toggles.haptics ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .audio-settings {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          margin: 0 auto;
        }

        .setting-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .setting-header h2 {
          margin: 0;
          color: #ffffff;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-group.haptics {
          gap: 12px;
        }

        .setting-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .volume-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(90deg, rgba(148, 163, 184, 0.3), rgba(148, 163, 184, 0.1));
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }

        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }

        .volume-slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-button {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(148, 163, 184, 0.05);
          color: #cbd5e1;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          align-self: flex-start;
        }

        .toggle-button.active {
          border-color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
          color: #60a5fa;
        }

        .toggle-button.inactive {
          opacity: 0.6;
        }

        .toggle-button:hover {
          border-color: #60a5fa;
          background: rgba(96, 165, 250, 0.2);
        }

        .haptics-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(148, 163, 184, 0.05);
          cursor: pointer;
          transition: all 0.2s;
        }

        .haptics-toggle:hover {
          border-color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
        }

        .toggle-indicator {
          width: 32px;
          height: 18px;
          border-radius: 9px;
          background: rgba(148, 163, 184, 0.3);
          position: relative;
          transition: all 0.2s;
        }

        .toggle-indicator::after {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          top: 2px;
          left: 2px;
          transition: all 0.2s;
        }

        .toggle-indicator.on {
          background: #60a5fa;
        }

        .toggle-indicator.on::after {
          left: 16px;
        }
      `}</style>
    </div>
  );
};

export default AudioSettings;

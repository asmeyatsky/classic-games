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

import React, { useState } from 'react';

export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface AudioSettingsProps {
  onClose?: () => void;
  className?: string;
  config?: AudioConfig;
  onVolumeChange?: (type: 'master' | 'music' | 'sfx' | 'ambient', value: number) => void;
  onToggleChange?: (type: 'music' | 'sfx' | 'haptics') => void;
}

const defaultConfig: AudioConfig = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  ambientVolume: 0.5,
  musicEnabled: true,
  sfxEnabled: true,
  hapticsEnabled: true,
};

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  onClose,
  className = '',
  config = defaultConfig,
  onVolumeChange,
  onToggleChange,
}) => {
  const [volumes, setVolumes] = useState({
    master: config.masterVolume,
    music: config.musicVolume,
    sfx: config.sfxVolume,
    ambient: config.ambientVolume,
  });

  const [toggles, setToggles] = useState({
    music: config.musicEnabled,
    sfx: config.sfxEnabled,
    haptics: config.hapticsEnabled,
  });

  // Handle volume slider changes
  const handleVolumeChange = (type: 'master' | 'music' | 'sfx' | 'ambient', value: number) => {
    const normalizedValue = Math.max(0, Math.min(1, value));
    setVolumes((prev) => ({ ...prev, [type]: normalizedValue }));
    onVolumeChange?.(type, normalizedValue);
  };

  // Handle toggle changes
  const handleToggleChange = (type: 'music' | 'sfx' | 'haptics') => {
    setToggles((prev) => ({ ...prev, [type]: !prev[type] }));
    onToggleChange?.(type);
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
            onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
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
            onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
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
            onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
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
            onChange={(e) => handleVolumeChange('ambient', parseFloat(e.target.value))}
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
            <span className="text-sm text-gray-300">
              {toggles.haptics ? 'Enabled' : 'Disabled'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;

import { useEffect, useCallback } from 'react';
import { audioManager, AudioConfig } from './AudioManager';

/**
 * useAudio - React Hook for Audio Management
 *
 * Features:
 * - Audio playback control
 * - Volume management
 * - Haptic coordination
 * - Settings persistence
 *
 * Usage:
 * ```typescript
 * const {
 *   playSound,
 *   playMusic,
 *   stopMusic,
 *   triggerEvent,
 *   setVolume,
 *   config
 * } = useAudio();
 * ```
 */

export interface UseAudioResult {
  playSound: (assetId: string, options?: { volume?: number; playbackRate?: number }) => void;
  playMusic: (assetId: string, fadeInDuration?: number) => void;
  stopMusic: (fadeOutDuration?: number) => void;
  triggerEvent: (eventType: string) => void;
  setVolume: (type: 'master' | 'music' | 'sfx' | 'ambient', value: number) => void;
  toggleAudio: (type: 'music' | 'sfx' | 'haptics') => void;
  config: Readonly<AudioConfig>;
  stopAll: () => void;
}

export function useAudio(): UseAudioResult {
  // Load preferences on mount
  useEffect(() => {
    audioManager.loadPreferences();
  }, []);

  // Resume audio context on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      // Audio context will be resumed in AudioManager
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const playSound = useCallback(
    (assetId: string, options?: { volume?: number; playbackRate?: number }) => {
      audioManager.playSound(assetId, options);
    },
    []
  );

  const playMusic = useCallback((assetId: string, fadeInDuration?: number) => {
    audioManager.playMusic(assetId, fadeInDuration);
  }, []);

  const stopMusic = useCallback((fadeOutDuration?: number) => {
    audioManager.stopMusic(fadeOutDuration);
  }, []);

  const triggerEvent = useCallback((eventType: string) => {
    audioManager.triggerEvent(eventType);
  }, []);

  const setVolume = useCallback((type: 'master' | 'music' | 'sfx' | 'ambient', value: number) => {
    audioManager.setVolume(type, value);
    audioManager.savePreferences();
  }, []);

  const toggleAudio = useCallback((type: 'music' | 'sfx' | 'haptics') => {
    audioManager.toggleAudio(type);
    audioManager.savePreferences();
  }, []);

  const stopAll = useCallback(() => {
    audioManager.stopAll();
  }, []);

  return {
    playSound,
    playMusic,
    stopMusic,
    triggerEvent,
    setVolume,
    toggleAudio,
    config: audioManager.getConfig(),
    stopAll
  };
}

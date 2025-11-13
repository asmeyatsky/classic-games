/**
 * Audio Context Provider - React Integration
 *
 * Provides audio functionality throughout the application
 * Manages initialization, state, and cleanup
 */

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { audioManager, AudioConfig } from './AudioManager';
import { soundLibrary } from './SoundLibrary';

interface AudioContextType {
  playSound: (assetId: string, options?: { volume?: number; playbackRate?: number }) => void;
  playMusic: (assetId: string, fadeInDuration?: number) => void;
  stopMusic: (fadeOutDuration?: number) => void;
  triggerEvent: (eventType: string) => void;
  setVolume: (type: 'master' | 'music' | 'sfx' | 'ambient', value: number) => void;
  toggleAudio: (type: 'music' | 'sfx' | 'haptics') => void;
  config: Readonly<AudioConfig>;
  stopAll: () => void;
  isInitialized: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
  initialConfig?: Partial<AudioConfig>;
  autoLoadPacks?: boolean;
}

/**
 * Audio Provider Component
 *
 * @example
 * ```typescript
 * <AudioProvider autoLoadPacks={true}>
 *   <App />
 * </AudioProvider>
 * ```
 */
export function AudioProvider({
  children,
  initialConfig,
  autoLoadPacks = true,
}: AudioProviderProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize audio on mount
  useEffect(() => {
    const initialize = async () => {
      // Load user preferences
      audioManager.loadPreferences();

      // Preload sound packs if enabled
      if (autoLoadPacks) {
        const allSounds = soundLibrary
          .getAllPacks()
          .flatMap((pack) =>
            Object.values(pack.sounds).map((sound) => audioManager.loadAudio(sound))
          );

        await Promise.allSettled(allSounds);
      }

      setIsInitialized(true);
    };

    initialize();

    // Cleanup on unmount
    return () => {
      audioManager.stopAll();
    };
  }, [autoLoadPacks]);

  const playSound = useCallback(
    (assetId: string, options?: { volume?: number; playbackRate?: number }) => {
      if (isInitialized) {
        audioManager.playSound(assetId, options);
      }
    },
    [isInitialized]
  );

  const playMusic = useCallback(
    (assetId: string, fadeInDuration?: number) => {
      if (isInitialized) {
        audioManager.playMusic(assetId, fadeInDuration);
      }
    },
    [isInitialized]
  );

  const stopMusic = useCallback((fadeOutDuration?: number) => {
    audioManager.stopMusic(fadeOutDuration);
  }, []);

  const triggerEvent = useCallback(
    (eventType: string) => {
      if (isInitialized) {
        audioManager.triggerEvent(eventType);
      }
    },
    [isInitialized]
  );

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

  const value: AudioContextType = {
    playSound,
    playMusic,
    stopMusic,
    triggerEvent,
    setVolume,
    toggleAudio,
    config: audioManager.getConfig(),
    stopAll,
    isInitialized,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

/**
 * Hook to use audio context
 *
 * @example
 * ```typescript
 * const { playSound, triggerEvent } = useAudioContext();
 * playSound('poker_deal');
 * triggerEvent('poker_win');
 * ```
 */
export function useAudioContext(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
}

/**
 * Hook for game-specific audio setup
 *
 * @example
 * ```typescript
 * const { setupGameAudio, playGameSound } = useGameAudio('poker');
 * ```
 */
export function useGameAudio(gameType: 'poker' | 'backgammon' | 'scrabble') {
  const audio = useAudioContext();

  const setupGameAudio = useCallback(async () => {
    const gameSounds = soundLibrary.getGameSounds(gameType);

    // Preload game sounds
    await Promise.allSettled(gameSounds.map((sound) => audioManager.loadAudio(sound)));
  }, [gameType]);

  const playGameSound = useCallback(
    (soundKey: string) => {
      const pack = soundLibrary.getSoundPack(gameType);
      if (pack && pack.sounds[soundKey]) {
        audio.playSound(pack.sounds[soundKey].id);
      }
    },
    [gameType, audio]
  );

  const triggerGameEvent = useCallback(
    (eventKey: string) => {
      audio.triggerEvent(`${gameType}_${eventKey}`);
    },
    [gameType, audio]
  );

  return {
    setupGameAudio,
    playGameSound,
    triggerGameEvent,
    ...audio,
  };
}

/**
 * Hook for ambient sounds
 *
 * @example
 * ```typescript
 * const { playAmbient, stopAmbient } = useAmbientSound();
 * ```
 */
export function useAmbientSound() {
  const audio = useAudioContext();

  const playAmbient = useCallback(
    (ambientId: string) => {
      const ambient = soundLibrary.getAmbientSound(ambientId);
      if (ambient) {
        audio.playMusic(ambient.id);
      }
    },
    [audio]
  );

  const playRandomAmbient = useCallback(() => {
    const ambient = soundLibrary.getRandomAmbient();
    audio.playMusic(ambient.id);
  }, [audio]);

  const stopAmbient = useCallback(() => {
    audio.stopMusic(2000);
  }, [audio]);

  return {
    playAmbient,
    playRandomAmbient,
    stopAmbient,
    getAmbientSounds: () => soundLibrary.getAllAmbientSounds(),
  };
}

/**
 * Hook for UI sounds
 *
 * @example
 * ```typescript
 * const { playUISound, playSuccess, playError } = useUISound();
 * ```
 */
export function useUISound() {
  const audio = useAudioContext();

  const playUISound = useCallback(
    (soundKey: string) => {
      audio.triggerEvent(`ui_${soundKey}`);
    },
    [audio]
  );

  const playClick = useCallback(() => audio.triggerEvent('ui_click'), [audio]);
  const playHover = useCallback(() => audio.triggerEvent('ui_hover'), [audio]);
  const playSuccess = useCallback(() => audio.triggerEvent('ui_success'), [audio]);
  const playError = useCallback(() => audio.triggerEvent('ui_error'), [audio]);
  const playNotification = useCallback(() => audio.triggerEvent('ui_notification'), [audio]);

  return {
    playUISound,
    playClick,
    playHover,
    playSuccess,
    playError,
    playNotification,
  };
}

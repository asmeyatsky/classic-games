/**
 * Sound Library - Comprehensive Sound Effect Management
 *
 * Manages:
 * - Sound effect packs (game-specific and UI)
 * - Ambient sound layers
 * - Sound catalog with metadata
 * - Preloading and caching
 * - Dynamic sound selection
 */

import { AudioAsset, SoundTrigger, HapticPattern } from './AudioManager';

export interface SoundPack {
  id: string;
  name: string;
  description: string;
  gameType?: 'poker' | 'backgammon' | 'scrabble';
  sounds: Record<string, AudioAsset>;
  triggers?: Record<string, SoundTrigger>;
}

export interface AmbientSound {
  id: string;
  name: string;
  url: string;
  duration: number;
  fadeIn?: number; // ms
  fadeOut?: number; // ms
  volume?: number;
}

export interface SoundCategory {
  name: string;
  sounds: Record<string, AudioAsset>;
  defaultVolume: number;
}

/**
 * Sound Library Manager
 */
export class SoundLibrary {
  private packs: Map<string, SoundPack> = new Map();
  private ambientSounds: Map<string, AmbientSound> = new Map();
  private categories: Map<string, SoundCategory> = new Map();

  constructor() {
    this.initializeDefaultSounds();
  }

  /**
   * Initialize default sound packs and categories
   */
  private initializeDefaultSounds(): void {
    // Initialize game sound packs
    this.registerGameSounds();
    // Initialize UI sounds
    this.registerUISounds();
    // Initialize ambient sounds
    this.registerAmbientSounds();
  }

  /**
   * Register game sound packs
   */
  private registerGameSounds(): void {
    // Poker Sound Pack
    this.packs.set('poker', {
      id: 'poker',
      name: 'Poker Sound Pack',
      description: 'Professional poker game sounds with casino atmosphere',
      gameType: 'poker',
      sounds: {
        background: {
          id: 'poker_bg',
          url: '/audio/poker/background.mp3',
          type: 'music',
          duration: 180,
          loop: true,
        },
        cardDeal: {
          id: 'poker_deal',
          url: '/audio/poker/card-deal.wav',
          type: 'sfx',
          duration: 0.3,
        },
        chipPlace: {
          id: 'poker_chip',
          url: '/audio/poker/chip-place.wav',
          type: 'sfx',
          duration: 0.2,
        },
        fold: {
          id: 'poker_fold',
          url: '/audio/poker/fold.wav',
          type: 'sfx',
          duration: 0.15,
        },
        allIn: {
          id: 'poker_all_in',
          url: '/audio/poker/all-in.wav',
          type: 'sfx',
          duration: 0.5,
        },
        win: {
          id: 'poker_win',
          url: '/audio/poker/win.wav',
          type: 'sfx',
          duration: 1.0,
        },
      },
    });

    // Backgammon Sound Pack
    this.packs.set('backgammon', {
      id: 'backgammon',
      name: 'Backgammon Sound Pack',
      description: 'Classic backgammon sounds with ancient board game ambiance',
      gameType: 'backgammon',
      sounds: {
        background: {
          id: 'backgammon_bg',
          url: '/audio/backgammon/background.mp3',
          type: 'music',
          duration: 180,
          loop: true,
        },
        diceRoll: {
          id: 'backgammon_dice',
          url: '/audio/backgammon/dice-roll.wav',
          type: 'sfx',
          duration: 0.8,
        },
        checkerMove: {
          id: 'backgammon_move',
          url: '/audio/backgammon/checker-move.wav',
          type: 'sfx',
          duration: 0.2,
        },
        capture: {
          id: 'backgammon_capture',
          url: '/audio/backgammon/capture.wav',
          type: 'sfx',
          duration: 0.4,
        },
        bornOff: {
          id: 'backgammon_born',
          url: '/audio/backgammon/born-off.wav',
          type: 'sfx',
          duration: 0.5,
        },
        win: {
          id: 'backgammon_win',
          url: '/audio/backgammon/win.wav',
          type: 'sfx',
          duration: 1.0,
        },
      },
    });

    // Scrabble Sound Pack
    this.packs.set('scrabble', {
      id: 'scrabble',
      name: 'Scrabble Sound Pack',
      description: 'Word game sounds with satisfying tile interactions',
      gameType: 'scrabble',
      sounds: {
        background: {
          id: 'scrabble_bg',
          url: '/audio/scrabble/background.mp3',
          type: 'music',
          duration: 180,
          loop: true,
        },
        tilePlace: {
          id: 'scrabble_place',
          url: '/audio/scrabble/tile-place.wav',
          type: 'sfx',
          duration: 0.3,
        },
        tilePick: {
          id: 'scrabble_pick',
          url: '/audio/scrabble/tile-pick.wav',
          type: 'sfx',
          duration: 0.15,
        },
        wordValid: {
          id: 'scrabble_valid',
          url: '/audio/scrabble/word-valid.wav',
          type: 'sfx',
          duration: 0.4,
        },
        wordInvalid: {
          id: 'scrabble_invalid',
          url: '/audio/scrabble/word-invalid.wav',
          type: 'sfx',
          duration: 0.3,
        },
        highScore: {
          id: 'scrabble_high',
          url: '/audio/scrabble/high-score.wav',
          type: 'sfx',
          duration: 0.8,
        },
        win: {
          id: 'scrabble_win',
          url: '/audio/scrabble/win.wav',
          type: 'sfx',
          duration: 1.0,
        },
      },
    });
  }

  /**
   * Register UI sound pack
   */
  private registerUISounds(): void {
    this.packs.set('ui', {
      id: 'ui',
      name: 'UI Sound Pack',
      description: 'Interface and interaction sounds',
      sounds: {
        click: {
          id: 'ui_click',
          url: '/audio/ui/click.wav',
          type: 'ui',
          duration: 0.1,
        },
        hover: {
          id: 'ui_hover',
          url: '/audio/ui/hover.wav',
          type: 'ui',
          duration: 0.08,
        },
        notification: {
          id: 'ui_notification',
          url: '/audio/ui/notification.wav',
          type: 'ui',
          duration: 0.3,
        },
        success: {
          id: 'ui_success',
          url: '/audio/ui/success.wav',
          type: 'ui',
          duration: 0.4,
        },
        error: {
          id: 'ui_error',
          url: '/audio/ui/error.wav',
          type: 'ui',
          duration: 0.3,
        },
        buttonPress: {
          id: 'ui_button',
          url: '/audio/ui/button-press.wav',
          type: 'ui',
          duration: 0.12,
        },
        swipe: {
          id: 'ui_swipe',
          url: '/audio/ui/swipe.wav',
          type: 'ui',
          duration: 0.15,
        },
      },
    });

    // Create UI category
    const uiPack = this.packs.get('ui')!;
    this.categories.set('ui', {
      name: 'UI Sounds',
      sounds: uiPack.sounds,
      defaultVolume: 0.6,
    });
  }

  /**
   * Register ambient sounds
   */
  private registerAmbientSounds(): void {
    // Casino ambient
    this.ambientSounds.set('casino', {
      id: 'ambient_casino',
      name: 'Casino Ambiance',
      url: '/audio/ambient/casino.mp3',
      duration: 300,
      fadeIn: 2000,
      fadeOut: 2000,
      volume: 0.3,
    });

    // Forest ambient
    this.ambientSounds.set('forest', {
      id: 'ambient_forest',
      name: 'Forest Ambiance',
      url: '/audio/ambient/forest.mp3',
      duration: 300,
      fadeIn: 2000,
      fadeOut: 2000,
      volume: 0.3,
    });

    // Library ambient
    this.ambientSounds.set('library', {
      id: 'ambient_library',
      name: 'Library Ambiance',
      url: '/audio/ambient/library.mp3',
      duration: 300,
      fadeIn: 2000,
      fadeOut: 2000,
      volume: 0.2,
    });

    // Ocean ambient
    this.ambientSounds.set('ocean', {
      id: 'ambient_ocean',
      name: 'Ocean Ambiance',
      url: '/audio/ambient/ocean.mp3',
      duration: 300,
      fadeIn: 2000,
      fadeOut: 2000,
      volume: 0.25,
    });
  }

  /**
   * Get sound pack
   */
  getSoundPack(packId: string): SoundPack | undefined {
    return this.packs.get(packId);
  }

  /**
   * Get all sound packs
   */
  getAllPacks(): SoundPack[] {
    return Array.from(this.packs.values());
  }

  /**
   * Get sounds for game type
   */
  getGameSounds(gameType: 'poker' | 'backgammon' | 'scrabble'): AudioAsset[] {
    const pack = this.packs.get(gameType);
    return pack ? Object.values(pack.sounds) : [];
  }

  /**
   * Get ambient sound
   */
  getAmbientSound(ambientId: string): AmbientSound | undefined {
    return this.ambientSounds.get(ambientId);
  }

  /**
   * Get all ambient sounds
   */
  getAllAmbientSounds(): AmbientSound[] {
    return Array.from(this.ambientSounds.values());
  }

  /**
   * Get random ambient sound
   */
  getRandomAmbient(): AmbientSound {
    const ambients = Array.from(this.ambientSounds.values());
    return ambients[Math.floor(Math.random() * ambients.length)];
  }

  /**
   * Register custom sound pack
   */
  registerSoundPack(pack: SoundPack): void {
    this.packs.set(pack.id, pack);
  }

  /**
   * Register custom ambient sound
   */
  registerAmbientSound(sound: AmbientSound): void {
    this.ambientSounds.set(sound.id, sound);
  }

  /**
   * Register sound category
   */
  registerCategory(category: SoundCategory): void {
    this.categories.set(category.name, category);
  }

  /**
   * Get sound by ID from any pack
   */
  getSoundById(soundId: string): AudioAsset | undefined {
    for (const pack of this.packs.values()) {
      for (const sound of Object.values(pack.sounds)) {
        if (sound.id === soundId) {
          return sound;
        }
      }
    }
    return undefined;
  }

  /**
   * Get total sound count
   */
  getTotalSoundCount(): number {
    let count = 0;
    for (const pack of this.packs.values()) {
      count += Object.keys(pack.sounds).length;
    }
    return count;
  }

  /**
   * Export library data
   */
  exportLibrary(): {
    packs: Record<string, SoundPack>;
    ambients: Record<string, AmbientSound>;
  } {
    return {
      packs: Object.fromEntries(this.packs),
      ambients: Object.fromEntries(this.ambientSounds),
    };
  }
}

// Singleton instance
export const soundLibrary = new SoundLibrary();

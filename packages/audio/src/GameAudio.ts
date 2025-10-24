import { audioManager, AudioAsset, SoundTrigger } from './AudioManager';

/**
 * Game Audio - Game-Specific Sound & Haptic Triggers
 *
 * Manages audio for:
 * - Background music per game/phase
 * - Sound effects for game events
 * - Haptic feedback patterns
 * - Audio contextual to game state
 */

// Audio Assets
export const POKER_AUDIO: Record<string, AudioAsset> = {
  background: {
    id: 'poker_bg',
    url: '/audio/poker/background.mp3',
    type: 'music',
    duration: 180,
    loop: true
  },
  cardDeal: {
    id: 'poker_deal',
    url: '/audio/poker/card-deal.wav',
    type: 'sfx',
    duration: 0.3
  },
  chipPlace: {
    id: 'poker_chip',
    url: '/audio/poker/chip-place.wav',
    type: 'sfx',
    duration: 0.2
  },
  fold: {
    id: 'poker_fold',
    url: '/audio/poker/fold.wav',
    type: 'sfx',
    duration: 0.15
  },
  allIn: {
    id: 'poker_all_in',
    url: '/audio/poker/all-in.wav',
    type: 'sfx',
    duration: 0.5
  },
  win: {
    id: 'poker_win',
    url: '/audio/poker/win.wav',
    type: 'sfx',
    duration: 1.0
  }
};

export const BACKGAMMON_AUDIO: Record<string, AudioAsset> = {
  background: {
    id: 'backgammon_bg',
    url: '/audio/backgammon/background.mp3',
    type: 'music',
    duration: 180,
    loop: true
  },
  diceRoll: {
    id: 'backgammon_dice',
    url: '/audio/backgammon/dice-roll.wav',
    type: 'sfx',
    duration: 0.8
  },
  checkerMove: {
    id: 'backgammon_move',
    url: '/audio/backgammon/checker-move.wav',
    type: 'sfx',
    duration: 0.2
  },
  capture: {
    id: 'backgammon_capture',
    url: '/audio/backgammon/capture.wav',
    type: 'sfx',
    duration: 0.4
  },
  bornOff: {
    id: 'backgammon_born',
    url: '/audio/backgammon/born-off.wav',
    type: 'sfx',
    duration: 0.5
  },
  win: {
    id: 'backgammon_win',
    url: '/audio/backgammon/win.wav',
    type: 'sfx',
    duration: 1.0
  }
};

export const SCRABBLE_AUDIO: Record<string, AudioAsset> = {
  background: {
    id: 'scrabble_bg',
    url: '/audio/scrabble/background.mp3',
    type: 'music',
    duration: 180,
    loop: true
  },
  tilePlace: {
    id: 'scrabble_place',
    url: '/audio/scrabble/tile-place.wav',
    type: 'sfx',
    duration: 0.3
  },
  tilePick: {
    id: 'scrabble_pick',
    url: '/audio/scrabble/tile-pick.wav',
    type: 'sfx',
    duration: 0.15
  },
  wordValid: {
    id: 'scrabble_valid',
    url: '/audio/scrabble/word-valid.wav',
    type: 'sfx',
    duration: 0.4
  },
  wordInvalid: {
    id: 'scrabble_invalid',
    url: '/audio/scrabble/word-invalid.wav',
    type: 'sfx',
    duration: 0.3
  },
  highScore: {
    id: 'scrabble_high',
    url: '/audio/scrabble/high-score.wav',
    type: 'sfx',
    duration: 0.8
  },
  win: {
    id: 'scrabble_win',
    url: '/audio/scrabble/win.wav',
    type: 'sfx',
    duration: 1.0
  }
};

// UI Audio Assets
export const UI_AUDIO: Record<string, AudioAsset> = {
  click: {
    id: 'ui_click',
    url: '/audio/ui/click.wav',
    type: 'ui',
    duration: 0.1
  },
  hover: {
    id: 'ui_hover',
    url: '/audio/ui/hover.wav',
    type: 'ui',
    duration: 0.08
  },
  notification: {
    id: 'ui_notification',
    url: '/audio/ui/notification.wav',
    type: 'ui',
    duration: 0.3
  },
  success: {
    id: 'ui_success',
    url: '/audio/ui/success.wav',
    type: 'ui',
    duration: 0.4
  },
  error: {
    id: 'ui_error',
    url: '/audio/ui/error.wav',
    type: 'ui',
    duration: 0.3
  }
};

/**
 * Setup Poker Audio
 */
export async function setupPokerAudio(): Promise<void> {
  // Load all audio assets
  await Promise.all(
    Object.values(POKER_AUDIO).map(asset => audioManager.loadAudio(asset))
  );

  // Register sound triggers with haptic patterns
  audioManager.registerSoundTrigger('poker_deal', {
    eventType: 'poker_deal',
    audio: POKER_AUDIO.cardDeal,
    haptic: { duration: 50, intensity: 0.3 },
    volume: 0.7
  });

  audioManager.registerSoundTrigger('poker_chip', {
    eventType: 'poker_chip',
    audio: POKER_AUDIO.chipPlace,
    haptic: { duration: 30, intensity: 0.5 },
    volume: 0.8
  });

  audioManager.registerSoundTrigger('poker_fold', {
    eventType: 'poker_fold',
    audio: POKER_AUDIO.fold,
    haptic: { duration: 40, intensity: 0.3 },
    volume: 0.6
  });

  audioManager.registerSoundTrigger('poker_all_in', {
    eventType: 'poker_all_in',
    audio: POKER_AUDIO.allIn,
    haptic: { duration: 100, intensity: 1.0 },
    volume: 0.9
  });

  audioManager.registerSoundTrigger('poker_win', {
    eventType: 'poker_win',
    audio: POKER_AUDIO.win,
    haptic: [
      { duration: 100, intensity: 0.8 },
      { duration: 100, intensity: 0.6, delay: 150 },
      { duration: 100, intensity: 1.0, delay: 300 }
    ],
    volume: 1.0
  });

  // Play background music
  audioManager.playMusic('poker_bg');
}

/**
 * Setup Backgammon Audio
 */
export async function setupBackgammonAudio(): Promise<void> {
  await Promise.all(
    Object.values(BACKGAMMON_AUDIO).map(asset => audioManager.loadAudio(asset))
  );

  audioManager.registerSoundTrigger('backgammon_dice', {
    eventType: 'backgammon_dice',
    audio: BACKGAMMON_AUDIO.diceRoll,
    haptic: [
      { duration: 80, intensity: 0.7 },
      { duration: 80, intensity: 0.5, delay: 100 },
      { duration: 80, intensity: 0.8, delay: 200 }
    ],
    volume: 0.8
  });

  audioManager.registerSoundTrigger('backgammon_move', {
    eventType: 'backgammon_move',
    audio: BACKGAMMON_AUDIO.checkerMove,
    haptic: { duration: 40, intensity: 0.4 },
    volume: 0.6
  });

  audioManager.registerSoundTrigger('backgammon_capture', {
    eventType: 'backgammon_capture',
    audio: BACKGAMMON_AUDIO.capture,
    haptic: { duration: 100, intensity: 0.9 },
    volume: 0.8
  });

  audioManager.registerSoundTrigger('backgammon_born', {
    eventType: 'backgammon_born',
    audio: BACKGAMMON_AUDIO.bornOff,
    haptic: { duration: 150, intensity: 0.8 },
    volume: 0.9
  });

  audioManager.registerSoundTrigger('backgammon_win', {
    eventType: 'backgammon_win',
    audio: BACKGAMMON_AUDIO.win,
    haptic: [
      { duration: 120, intensity: 0.9 },
      { duration: 120, intensity: 0.7, delay: 200 },
      { duration: 120, intensity: 1.0, delay: 400 }
    ],
    volume: 1.0
  });

  audioManager.playMusic('backgammon_bg');
}

/**
 * Setup Scrabble Audio
 */
export async function setupScrabbleAudio(): Promise<void> {
  await Promise.all(
    Object.values(SCRABBLE_AUDIO).map(asset => audioManager.loadAudio(asset))
  );

  audioManager.registerSoundTrigger('scrabble_place', {
    eventType: 'scrabble_place',
    audio: SCRABBLE_AUDIO.tilePlace,
    haptic: { duration: 50, intensity: 0.6 },
    volume: 0.7
  });

  audioManager.registerSoundTrigger('scrabble_pick', {
    eventType: 'scrabble_pick',
    audio: SCRABBLE_AUDIO.tilePick,
    haptic: { duration: 30, intensity: 0.4 },
    volume: 0.5
  });

  audioManager.registerSoundTrigger('scrabble_valid', {
    eventType: 'scrabble_valid',
    audio: SCRABBLE_AUDIO.wordValid,
    haptic: { duration: 80, intensity: 0.7 },
    volume: 0.8
  });

  audioManager.registerSoundTrigger('scrabble_invalid', {
    eventType: 'scrabble_invalid',
    audio: SCRABBLE_AUDIO.wordInvalid,
    haptic: [
      { duration: 60, intensity: 0.5 },
      { duration: 60, intensity: 0.5, delay: 100 }
    ],
    volume: 0.7
  });

  audioManager.registerSoundTrigger('scrabble_high', {
    eventType: 'scrabble_high',
    audio: SCRABBLE_AUDIO.highScore,
    haptic: { duration: 200, intensity: 0.9 },
    volume: 0.9
  });

  audioManager.registerSoundTrigger('scrabble_win', {
    eventType: 'scrabble_win',
    audio: SCRABBLE_AUDIO.win,
    haptic: [
      { duration: 100, intensity: 0.8 },
      { duration: 100, intensity: 0.6, delay: 150 },
      { duration: 100, intensity: 1.0, delay: 300 }
    ],
    volume: 1.0
  });

  audioManager.playMusic('scrabble_bg');
}

/**
 * Setup UI Audio
 */
export async function setupUIAudio(): Promise<void> {
  await Promise.all(
    Object.values(UI_AUDIO).map(asset => audioManager.loadAudio(asset))
  );

  audioManager.registerSoundTrigger('ui_click', {
    eventType: 'ui_click',
    audio: UI_AUDIO.click,
    haptic: { duration: 20, intensity: 0.3 },
    volume: 0.5
  });

  audioManager.registerSoundTrigger('ui_hover', {
    eventType: 'ui_hover',
    audio: UI_AUDIO.hover,
    haptic: { duration: 15, intensity: 0.2 },
    volume: 0.4
  });

  audioManager.registerSoundTrigger('ui_notification', {
    eventType: 'ui_notification',
    audio: UI_AUDIO.notification,
    haptic: { duration: 60, intensity: 0.5 },
    volume: 0.6
  });

  audioManager.registerSoundTrigger('ui_success', {
    eventType: 'ui_success',
    audio: UI_AUDIO.success,
    haptic: { duration: 80, intensity: 0.7 },
    volume: 0.7
  });

  audioManager.registerSoundTrigger('ui_error', {
    eventType: 'ui_error',
    audio: UI_AUDIO.error,
    haptic: [
      { duration: 60, intensity: 0.6 },
      { duration: 60, intensity: 0.6, delay: 100 }
    ],
    volume: 0.7
  });
}

/**
 * Initialize all game audio
 */
export async function initializeGameAudio(gameType: 'poker' | 'backgammon' | 'scrabble'): Promise<void> {
  await setupUIAudio();

  switch (gameType) {
    case 'poker':
      await setupPokerAudio();
      break;
    case 'backgammon':
      await setupBackgammonAudio();
      break;
    case 'scrabble':
      await setupScrabbleAudio();
      break;
  }
}

/**
 * Classic Games Audio System
 *
 * Comprehensive audio management for all games with:
 * - Sound effects and background music
 * - Haptic feedback coordination
 * - Web Audio API integration
 * - React hooks and context
 * - Sound library management
 * - Volume and preference management
 *
 * @example
 * ```typescript
 * // In React component
 * import { AudioProvider, useAudioContext, useGameAudio } from '@classic-games/audio';
 *
 * <AudioProvider autoLoadPacks={true}>
 *   <GameComponent />
 * </AudioProvider>
 *
 * // In game component
 * const { playGameSound, triggerGameEvent } = useGameAudio('poker');
 * playGameSound('cardDeal');
 * triggerGameEvent('poker_win');
 * ```
 */

// Core audio management
export * from './AudioManager';
export * from './GameAudio';
export * from './useAudio';

// Sound library
export * from './SoundLibrary';

// React integration
export * from './AudioProvider';

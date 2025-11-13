/**
 * @classic-games/config
 *
 * Centralized configuration and constants for the Classic Games platform.
 * This package exports all shared constants used across the monorepo.
 *
 * Usage:
 * ```typescript
 * import { POKER_CONFIG, UI_CONFIG, SERVER_CONFIG } from '@classic-games/config';
 * ```
 */

// Game Configurations
export * from './games';

// UI Configuration
export { UI_CONFIG, GAME_COLORS, type Breakpoint, type Color, type ZIndex } from './ui';

// Server Configuration
export { SERVER_CONFIG, ENVIRONMENTS, type Environment } from './server';

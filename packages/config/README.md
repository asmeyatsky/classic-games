# @classic-games/config

Shared configuration and constants for the Classic Games platform.

## Overview

This package centralizes all magic numbers, configuration values, and constants used across the Classic Games monorepo. It provides a single source of truth for:

- Game rules and configurations (Poker, Backgammon, Scrabble)
- UI design tokens and breakpoints
- Server and network settings
- Game-specific color schemes

## Installation

This package is automatically included when you install the monorepo dependencies.

## Usage

### Game Configurations

```typescript
import { POKER_CONFIG, BACKGAMMON_CONFIG, SCRABBLE_CONFIG } from '@classic-games/config';

// Poker
const minPlayers = POKER_CONFIG.RULES.MIN_PLAYERS;
const royalFlush = POKER_CONFIG.HAND_RANKINGS.ROYAL_FLUSH;

// Backgammon
const boardPoints = BACKGAMMON_CONFIG.BOARD.TOTAL_POINTS;
const whiteStartPos = BACKGAMMON_CONFIG.BOARD.STARTING_CONFIGURATION.WHITE;

// Scrabble
const boardSize = SCRABBLE_CONFIG.BOARD.WIDTH;
const tileValue = SCRABBLE_CONFIG.TILE_VALUES.Q;
const tileDistribution = SCRABBLE_CONFIG.TILE_DISTRIBUTION;
```

### UI Configuration

```typescript
import { UI_CONFIG, GAME_COLORS } from '@classic-games/config';

// Breakpoints
const mobileBreakpoint = UI_CONFIG.BREAKPOINTS.MOBILE;

// Colors
const primary = UI_CONFIG.COLORS.PRIMARY;

// Game-specific colors
const pokerFelt = GAME_COLORS.POKER.TABLE_FELT;
const scrabbleBoard = GAME_COLORS.SCRABBLE.BOARD_BASE;

// Typography
const fontSize = UI_CONFIG.TYPOGRAPHY.FONT_SIZE.BASE;
const fontWeight = UI_CONFIG.TYPOGRAPHY.FONT_WEIGHT.BOLD;

// Spacing
const padding = UI_CONFIG.SPACING.MD;

// Animation durations
const animationDuration = UI_CONFIG.ANIMATION_DURATION.BASE;
```

### Server Configuration

```typescript
import { SERVER_CONFIG, ENVIRONMENTS } from '@classic-games/config';

// Server ports
const wsPort = SERVER_CONFIG.PORTS.DEVELOPMENT;

// WebSocket settings
const reconnectInterval = SERVER_CONFIG.WEBSOCKET.RECONNECT_INTERVAL;

// Game server limits
const maxRooms = SERVER_CONFIG.GAME_SERVER.MAX_ROOMS;

// Database pool
const poolSize = SERVER_CONFIG.DATABASE.POOL_SIZE;

// Rate limiting
const maxRequests = SERVER_CONFIG.RATE_LIMIT.MAX_REQUESTS;
```

## Configuration Structure

### Game Configurations

Each game configuration includes:

- **RULES**: Core game rules (player counts, starting values)
- **BOARD/CARDS**: Game-specific board and piece definitions
- **PHASES**: Valid game states/phases
- **ACTIONS**: Valid player actions
- **ANIMATION_TIMINGS**: Animation durations for smooth UX
- **SPECIAL**: Game-specific special rules

### UI Configuration

- **BREAKPOINTS**: Responsive design breakpoints
- **COLORS**: Design system color palette
- **TYPOGRAPHY**: Font families, sizes, and weights
- **SPACING**: Consistent spacing scale
- **BORDER_RADIUS**: Border radius values
- **SHADOWS**: Shadow definitions
- **ZINDEX**: Z-index scale for layering
- **ANIMATION_DURATION**: Transition durations
- **SIZES**: Standard component sizes
- **GRAPHICS_3D**: Three.js configuration
- **MOBILE**: Mobile-specific settings

### Server Configuration

- **PORTS**: Application ports
- **WEBSOCKET**: Real-time connection settings
- **GAME_SERVER**: Server resource limits
- **DATABASE**: Connection pool configuration
- **RATE_LIMIT**: Request throttling
- **SESSION**: User session management
- **CORS**: Cross-origin resource sharing
- **LOGGING**: Log configuration
- **SECURITY**: Security headers and policies
- **API**: API response configuration

## Adding New Constants

When adding new constants:

1. **Identify the category** (game-specific, UI, or server)
2. **Create or update** the appropriate configuration file
3. **Use TypeScript interfaces** for type safety
4. **Add JSDoc comments** explaining the constant's purpose
5. **Update exports** in `src/index.ts`
6. **Update this README** with examples

Example:

```typescript
// In packages/config/src/games/poker.ts

export const POKER_CONFIG = {
  // ... existing config
  NEW_FEATURE: {
    VALUE: 'some-value',
    DESCRIPTION: 'What this is for',
  },
} as const;

// Export types if needed
export type NewFeatureType = typeof POKER_CONFIG.NEW_FEATURE;
```

## Best Practices

1. **Use `as const`** to enable TypeScript literal types
2. **Group related values** into logical objects
3. **Add TypeScript type exports** for complex configurations
4. **Use descriptive names** that clearly indicate purpose
5. **Include comments** explaining why specific values exist
6. **Keep values immutable** - use `readonly` where applicable
7. **Update tests** when changing critical values

## Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Type Safety

This package is fully typed with TypeScript. All configurations export types that can be used throughout the application:

```typescript
import { POKER_CONFIG, type PokerPhase } from '@classic-games/config';

const currentPhase: PokerPhase = POKER_CONFIG.PHASES.PRE_FLOP;
```

## Contributing

When contributing changes to configurations:

1. Update the relevant configuration file(s)
2. Update type exports if necessary
3. Update this README with examples
4. Run `npm run build` to ensure compilation succeeds
5. Submit PR with clear explanation of configuration changes

---

For more information, see the [main project README](../../README.md) and [Architecture Guide](../../ARCHITECTURE.md).

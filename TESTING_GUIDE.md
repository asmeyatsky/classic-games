# Classic Games - Testing Guide

Complete testing instructions for the world-class gaming platform.

---

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Running Applications](#running-applications)
3. [Testing Game Logic](#testing-game-logic)
4. [Testing Multiplayer](#testing-multiplayer)
5. [Testing Audio System](#testing-audio-system)
6. [Manual Testing Checklist](#manual-testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Prerequisites
```bash
# Check Node.js version (need 18+)
node --version

# Check npm version
npm --version
```

### Install Dependencies
```bash
# Install root dependencies
npm install

# This installs dependencies for all packages (monorepo)
# Turborepo will handle building dependencies in correct order
```

### Build All Packages
```bash
# Build all packages in correct dependency order
npm run build

# Or build specific package
npm run build --workspace=packages/game-engine
```

---

## Running Applications

### Option 1: Run Everything Locally (Development Mode)

#### Terminal 1 - Web App
```bash
cd apps/web
npm run dev

# Opens at http://localhost:3000
```

#### Terminal 2 - Backend Server
```bash
cd apps/backend
npm run dev

# Runs on http://localhost:3001
# WebSocket on ws://localhost:3002
```

#### Terminal 3 - Mobile App (React Native)
```bash
cd apps/mobile
npm start

# Follow prompts to run on iOS simulator or Android emulator
```

### Option 2: Quick Web-Only Testing
```bash
cd apps/web
npm install
npm run dev
```

This starts just the web app with mock multiplayer for testing.

---

## Testing Game Logic

### 1. Test Poker Game Engine

**File**: `packages/game-engine/src/poker/PokerGame.ts`

Create a test file:
```bash
cat > test-poker.js << 'EOF'
const { PokerGame, Card, HandEvaluator } = require('./packages/game-engine');

// Create a game
const game = new PokerGame(6, 1, 2); // 6 players, small blind 1, big blind 2

// Add players
for (let i = 0; i < 6; i++) {
  game.addPlayer(`Player${i}`, 1000);
}

// Start game
game.startHand();

// Test betting
console.log('Initial game state:', {
  players: game.players.length,
  pot: game.pot,
  stage: game.stage
});

// Place bet
game.placeBet(0, 10); // Player 0 bets 10
console.log('After bet - Pot:', game.pot);

// Test hand evaluation
const hand1 = [
  new Card('A', '♠'),
  new Card('K', '♠'),
  new Card('Q', '♠'),
  new Card('J', '♠'),
  new Card('10', '♠')
];

const hand2 = [
  new Card('9', '♣'),
  new Card('8', '♣'),
  new Card('7', '♣'),
  new Card('6', '♣'),
  new Card('5', '♣')
];

const eval = new HandEvaluator();
const hand1Rank = eval.evaluateHand(hand1);
const hand2Rank = eval.evaluateHand(hand2);

console.log('Hand 1 (Royal Flush):', hand1Rank);
console.log('Hand 2 (Straight Flush):', hand2Rank);
console.log('Hand 1 wins:', hand1Rank > hand2Rank);
EOF

node test-poker.js
```

### 2. Test Backgammon Game Engine

**File**: `packages/game-engine/src/backgammon/BackgammonGame.ts`

```bash
cat > test-backgammon.js << 'EOF'
const { BackgammonGame } = require('./packages/game-engine');

// Create a game
const game = new BackgammonGame('player1', 'player2');

console.log('Game initialized:', {
  player1: game.players[0].name,
  player2: game.players[1].name,
  isRunning: game.isRunning
});

// Roll dice
const dice = game.rollDice();
console.log('Dice rolled:', dice);

// Get legal moves
const moves = game.getLegalMoves(dice);
console.log('Legal moves available:', moves.length);

// Make a move
if (moves.length > 0) {
  game.makeMove(moves[0]);
  console.log('Move made successfully');
}

// Check game state
console.log('Current player:', game.currentPlayer.name);
console.log('Player 1 board:', game.players[0].points.map(p => p.checkers));
EOF

node test-backgammon.js
```

### 3. Test Scrabble Game Engine

**File**: `packages/game-engine/src/scrabble/ScrabbleGame.ts`

```bash
cat > test-scrabble.js << 'EOF'
const { ScrabbleGame, Dictionary } = require('./packages/game-engine');

// Check dictionary
const dict = new Dictionary();
console.log('Dictionary loaded:', {
  hasWord: dict.isValidWord('HELLO'),
  hasWord2: dict.isValidWord('COMPUTER'),
  invalidWord: dict.isValidWord('ZZZZZ')
});

// Create a game
const game = new ScrabbleGame('player1', 'player2');

console.log('Scrabble game initialized:', {
  players: game.players.length,
  boardSize: game.board.size,
  tilesInBag: game.tileBag.remaining()
});

// Get initial tiles
const tiles = game.drawTiles(7);
console.log('Initial rack:', tiles.map(t => t.letter));

// Test word placement validation
const isValid = game.isValidPlacement('HELLO', { row: 7, col: 7 }, 'horizontal');
console.log('HELLO at center (7,7) horizontal:', isValid);

// Test scoring
const score = game.calculateScore('HELLO', { row: 7, col: 7 }, 'horizontal');
console.log('Score for HELLO:', score);
EOF

node test-scrabble.js
```

---

## Testing Multiplayer

### 1. Test WebSocket Server

```bash
# Terminal 1 - Start backend
cd apps/backend
npm run dev

# Terminal 2 - Test WebSocket connection
cat > test-ws.js << 'EOF'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3002');

ws.on('open', () => {
  console.log('✓ Connected to WebSocket server');

  // Send join message
  ws.send(JSON.stringify({
    type: 'join',
    playerId: 'test-player-1',
    playerName: 'Test Player',
    roomId: 'room-1',
    gameType: 'poker'
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('Received:', msg.type, msg);
});

ws.on('error', (err) => {
  console.error('Error:', err);
});

setTimeout(() => {
  ws.send(JSON.stringify({
    type: 'move',
    playerId: 'test-player-1',
    roomId: 'room-1',
    payload: { action: 'bet', amount: 100 }
  }));
}, 1000);

setTimeout(() => ws.close(), 5000);
EOF

node test-ws.js
```

### 2. Test Multiplayer Game Hook

Test in React component:
```typescript
// apps/web/test-multiplayer.tsx
import { useMultiplayerGame } from '@apps/web/src/hooks/useMultiplayerGame';

export function TestMultiplayer() {
  const {
    gameState,
    players,
    connected,
    connectionStatus,
    error,
    joinRoom,
    makeMove,
    leaveRoom
  } = useMultiplayerGame();

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      <p>Connected: {connected ? '✓' : '✗'}</p>
      <p>Players: {players.length}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <button onClick={() => joinRoom('player1', 'Test Player', 'room1', 'poker')}>
        Join Room
      </button>
      <button onClick={() => makeMove({ type: 'bet', amount: 100 })}>
        Make Move
      </button>
      <button onClick={leaveRoom}>Leave Room</button>
    </div>
  );
}
```

---

## Testing Audio System

### 1. Test Audio Manager Directly

```bash
cat > test-audio.js << 'EOF'
const { audioManager } = require('./packages/audio');

console.log('Audio Manager initialized:', {
  masterVolume: audioManager.getConfig().masterVolume,
  musicEnabled: audioManager.getConfig().musicEnabled,
  sfxEnabled: audioManager.getConfig().sfxEnabled,
  hapticsEnabled: audioManager.getConfig().hapticsEnabled
});

// Test volume control
audioManager.setVolume('master', 0.5);
audioManager.setVolume('music', 0.7);
audioManager.setVolume('sfx', 0.8);

console.log('After volume changes:', audioManager.getConfig());

// Test toggle
audioManager.toggleAudio('music');
console.log('Music toggled:', audioManager.getConfig().musicEnabled);

// Test preferences save
audioManager.savePreferences();
console.log('Preferences saved to localStorage');

// Test preferences load
audioManager.loadPreferences();
console.log('Preferences loaded from localStorage');
EOF

node test-audio.js
```

### 2. Test Audio in React

```typescript
// In a React component
import { useAudio } from '@packages/audio';

export function TestAudio() {
  const { playSound, playMusic, stopMusic, triggerEvent, config } = useAudio();

  return (
    <div>
      <h2>Audio Test Panel</h2>
      <p>Master Volume: {Math.round(config.masterVolume * 100)}%</p>

      <button onClick={() => playSound('ui_click')}>Play Click Sound</button>
      <button onClick={() => playMusic('poker_bg')}>Play Poker Music</button>
      <button onClick={() => stopMusic()}>Stop Music</button>
      <button onClick={() => triggerEvent('poker_chip')}>Trigger Chip + Haptic</button>
      <button onClick={() => triggerEvent('poker_win')}>Trigger Win + Haptic Sequence</button>
    </div>
  );
}
```

---

## Testing User Features

### 1. Test UserManager

```bash
cat > test-users.js << 'EOF'
const { userManager } = require('./apps/backend/src/services/UserManager');

// Create users
const user1 = userManager.createUser('player1', 'p1@example.com', 'Player One');
const user2 = userManager.createUser('player2', 'p2@example.com', 'Player Two');

console.log('Users created:', {
  user1: user1.username,
  user2: user2.username
});

// Record game results
userManager.recordGameResult(user1.id, 'poker', 'win', 2500);
userManager.recordGameResult(user1.id, 'poker', 'loss', 1500);
userManager.recordGameResult(user1.id, 'backgammon', 'win', 3000);

console.log('User 1 stats:', {
  totalGames: user1.statistics.totalGames,
  wins: user1.statistics.totalWins,
  winRate: user1.statistics.winRate
});

// Get leaderboard
const pokerLeaderboard = userManager.getLeaderboard('poker', 'allTime');
console.log('Poker leaderboard:', pokerLeaderboard);

// Unlock achievements
userManager.unlockAchievement(user1.id, 'first_game');
userManager.unlockAchievement(user1.id, 'ten_wins');

const achievements = userManager.getAchievements(user1.id);
console.log('User 1 achievements:', achievements.map(a => a.name));

// Social features
userManager.addFriend(user1.id, user2.id);
const friends = userManager.getFriends(user1.id);
console.log('User 1 friends:', friends.map(f => f.username));

// Follow user
userManager.followUser(user2.id, user1.id);
const followers = userManager.getFollowersCount(user1.id);
console.log('User 1 followers:', followers);
EOF

node test-users.js
```

---

## Manual Testing Checklist

### Web App Testing

- [ ] **Home Page**
  - [ ] Page loads without errors
  - [ ] Three game buttons visible (Poker, Backgammon, Scrabble)
  - [ ] Responsive on mobile/tablet

- [ ] **Poker Screen**
  - [ ] Table renders with 6 seats
  - [ ] Player info displays correctly
  - [ ] Betting slider works
  - [ ] Cards visible and readable
  - [ ] Community cards display
  - [ ] Action buttons (Fold, Check, Raise) functional
  - [ ] Animations smooth (60fps target)

- [ ] **Backgammon Screen**
  - [ ] 24-point board visible
  - [ ] Dice roll works
  - [ ] Checkers display correctly
  - [ ] Bearing off areas work
  - [ ] Valid moves only allowed

- [ ] **Scrabble Screen**
  - [ ] 15x15 board visible
  - [ ] Premium squares color-coded (TW, DW, TL, LL)
  - [ ] Tile rack displays 7 tiles
  - [ ] Tiles draggable
  - [ ] Word validation works
  - [ ] Score calculates correctly

### Mobile App Testing

- [ ] App launches on iOS simulator
- [ ] App launches on Android emulator
- [ ] Portrait orientation works
- [ ] Touch targets are large (48px+)
- [ ] Haptic feedback triggers on interactions
- [ ] Bottom navigation switches between games
- [ ] Safe area handles notch/home indicator

### Audio System Testing

- [ ] AudioSettings component appears
- [ ] Volume sliders work (0-100%)
- [ ] Toggle buttons enable/disable audio
- [ ] Settings persist after reload
- [ ] Haptic feedback can be disabled
- [ ] No console errors on audio load

### User Features Testing

- [ ] User profile displays stats
- [ ] Leaderboard shows ranked players
- [ ] Period selector changes timeframe
- [ ] Achievement badges show locked/unlocked
- [ ] Achievement detail modal works
- [ ] Win rate calculates correctly

### Multiplayer Testing

- [ ] Two browser windows connect to same room
- [ ] Game state syncs between clients
- [ ] Moves update in real-time
- [ ] Disconnect/reconnect works
- [ ] Multiple rooms work independently
- [ ] Server validates moves correctly

---

## Automated Testing Setup

### Jest Configuration for Game Logic

```bash
# Install testing dependencies
npm install --save-dev jest @types/jest ts-jest

# Create jest config
cat > packages/game-engine/jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
EOF

# Create test file
cat > packages/game-engine/src/__tests__/poker.test.ts << 'EOF'
import { PokerGame, HandEvaluator } from '../poker';

describe('PokerGame', () => {
  let game: PokerGame;

  beforeEach(() => {
    game = new PokerGame(6, 1, 2);
  });

  test('should initialize with 6 players', () => {
    for (let i = 0; i < 6; i++) {
      game.addPlayer(`Player${i}`, 1000);
    }
    expect(game.players).toHaveLength(6);
  });

  test('should handle betting correctly', () => {
    game.addPlayer('Player1', 1000);
    game.startHand();
    game.placeBet(0, 10);
    expect(game.pot).toBe(10);
  });
});

describe('HandEvaluator', () => {
  const evaluator = new HandEvaluator();

  test('should identify royal flush', () => {
    // Test royal flush ranking
  });

  test('should evaluate hand rankings correctly', () => {
    // Test hand comparisons
  });
});
EOF

# Run tests
npm test
```

---

## Performance Testing

### 1. Check Rendering Performance

```bash
# Web app - Check FPS in Chrome DevTools
# 1. Open http://localhost:3000
# 2. Open DevTools (F12)
# 3. Performance tab
# 4. Record 10 seconds of poker game
# 5. Verify 60fps target

# Mobile app - Use Xcode/Android Studio profiler
```

### 2. Load Testing WebSocket Server

```bash
cat > load-test.js << 'EOF'
const WebSocket = require('ws');

const NUM_CLIENTS = 100;
let connected = 0;
let messages = 0;

console.log(`Connecting ${NUM_CLIENTS} clients...`);

for (let i = 0; i < NUM_CLIENTS; i++) {
  const ws = new WebSocket('ws://localhost:3002');

  ws.on('open', () => {
    connected++;
    ws.send(JSON.stringify({
      type: 'join',
      playerId: `player-${i}`,
      playerName: `Player ${i}`,
      roomId: `room-${Math.floor(i / 2)}`,
      gameType: 'poker'
    }));
  });

  ws.on('message', () => {
    messages++;
  });
}

// Print stats every second
setInterval(() => {
  console.log(`Connected: ${connected}/${NUM_CLIENTS} | Messages: ${messages}`);
}, 1000);
EOF

node load-test.js
```

---

## Troubleshooting

### Issue: Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Remove lock file and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
```bash
# Rebuild all packages
npm run build

# Check for type errors
npm run type-check
```

### Issue: Port already in use
```bash
# Find process using port
lsof -i :3000      # Web
lsof -i :3001      # Backend
lsof -i :3002      # WebSocket

# Kill process
kill -9 <PID>
```

### Issue: Audio not playing
```bash
# Check AudioContext state in DevTools console
audioManager.audioContext.state

# If suspended, click page to resume
# Audio context requires user interaction
```

### Issue: Multiplayer not syncing
```bash
# Check WebSocket connection
# Open DevTools → Network → WS
# Verify messages are sent/received

# Check backend logs for errors
cd apps/backend && npm run dev
```

---

## Quick Test Commands

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Start web app (port 3000)
cd apps/web && npm run dev

# Start backend (ports 3001, 3002)
cd apps/backend && npm run dev

# Run tests (when configured)
npm test

# Type check all packages
npm run type-check

# Lint code
npm run lint
```

---

## Success Criteria

✅ All game logic works without errors
✅ Web app renders at 60fps
✅ Multiplayer syncs in real-time
✅ Audio/haptics trigger correctly
✅ User data persists correctly
✅ Mobile app responsive and touch-friendly
✅ No console errors in DevTools
✅ Type checking passes
✅ Can win games on all platforms

---

**Happy Testing! 🎮**

If you encounter issues, check the error messages in:
- Browser Console (web/mobile web)
- Xcode Console (iOS)
- Android Logcat (Android)
- Terminal output (backend)

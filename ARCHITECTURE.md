# Classic Games - Technical Architecture

## Overview

This is a world-class, cross-platform gaming suite featuring realistic 3D graphics and online multiplayer for three classic games: Poker, Backgammon, and Scrabble.

## Technology Stack

### Frontend
- **React** 19.1.1 - UI framework
- **React Native + Expo** - Native mobile apps (iOS & Android)
- **Next.js** 15.5.0 - Web application with SSR
- **TypeScript** 5.9.2 - Type safety
- **Three.js** - 3D graphics engine
- **React Three Fiber** - React renderer for Three.js
- **Expo GL** - Three.js for React Native

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **PostgreSQL** - Database for user data and game state
- **Redis** - Session management and caching

### Infrastructure
- **Turborepo** - Monorepo management
- **Firebase Auth** - Authentication
- **AWS S3** - Asset storage
- **AWS EC2/Fargate** - Backend hosting
- **Vercel** - Web app hosting

## Project Structure

```
classic-games-monorepo/
├── apps/
│   ├── mobile/              # React Native + Expo app
│   │   ├── App.tsx
│   │   ├── app.json
│   │   ├── screens/
│   │   ├── navigation/
│   │   └── package.json
│   │
│   ├── web/                 # Next.js web app
│   │   ├── src/
│   │   │   ├── app/         # App router
│   │   │   ├── components/  # Web-specific components
│   │   │   └── lib/         # Web utilities
│   │   ├── public/          # Static assets
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── backend/             # Node.js server
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── services/    # Business logic
│       │   ├── models/      # Database models
│       │   ├── socket/      # WebSocket handlers
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── shared-ui/           # Shared UI components
│   │   ├── src/
│   │   │   ├── components/  # Platform-agnostic components
│   │   │   └── theme/       # Design system
│   │   └── package.json
│   │
│   ├── game-engine/         # Core game logic
│   │   ├── src/
│   │   │   ├── poker/       # ✅ Complete poker implementation
│   │   │   ├── backgammon/  # 🚧 Stub
│   │   │   ├── scrabble/    # 🚧 Stub
│   │   │   └── types/       # Shared types
│   │   └── package.json
│   │
│   ├── three-components/    # 3D components
│   │   ├── src/
│   │   │   ├── poker/       # 3D poker assets
│   │   │   ├── backgammon/  # 3D backgammon assets
│   │   │   ├── scrabble/    # 3D scrabble assets
│   │   │   └── common/      # Shared 3D utilities
│   │   └── package.json
│   │
│   └── utils/               # ✅ Shared utilities
│       ├── src/
│       │   └── index.ts     # Helper functions
│       └── package.json
│
├── package.json             # Root package.json with workspaces
├── turbo.json              # Turborepo configuration
├── tsconfig.json           # Base TypeScript config
└── README.md
```

## Key Features

### 1. Unified Codebase
- Monorepo architecture using Turborepo
- Shared packages for game logic, UI components, and utilities
- Code reuse across web and mobile platforms
- Single source of truth for game rules

### 2. Realistic 3D Graphics
- **Web**: React Three Fiber with custom shaders
- **Mobile**: Expo GL for Three.js compatibility
- Physically-based rendering (PBR) materials
- Real-time shadows and lighting
- Smooth animations and transitions

### 3. Online Multiplayer
- Real-time communication via WebSocket (Socket.io)
- Room-based matchmaking system
- State synchronization across clients
- Reconnection handling
- Spectator mode

### 4. Mobile-First Design
- Touch-optimized controls
- Gesture recognition (swipe, pinch, rotate)
- Haptic feedback for interactions
- Adaptive UI for different screen sizes
- Portrait and landscape support

### 5. Cross-Platform Features
- Shared authentication (Firebase)
- Cloud save synchronization
- Offline mode with local AI
- Push notifications
- In-app purchases (optional)

## Game Implementations

### Poker (Texas Hold'em) ✅
**Status**: Core logic complete

**Features**:
- Full Texas Hold'em rules
- Hand evaluation (Royal Flush to High Card)
- Betting rounds (Pre-flop, Flop, Turn, River)
- All-in and side pot calculation
- AI opponents with basic strategy

**3D Assets** (TODO):
- Realistic playing cards with bend/flip animations
- Stackable poker chips with physics
- Felt-covered table with reflections
- Card dealing animations with particles

### Backgammon 🚧
**Status**: Stub created

**Planned Features**:
- Standard backgammon rules
- Dice rolling with physics simulation
- Move validation and highlighting
- Doubling cube
- AI opponent with strong strategy
- Match play and Crawford rule

**3D Assets** (TODO):
- Wooden board with inlaid points
- Realistic checkers with stacking
- Dice with rolling physics
- Dice cup animation

### Scrabble 🚧
**Status**: Stub created

**Planned Features**:
- Official Scrabble rules
- Comprehensive dictionary (OSPD/TWL/SOWPODS)
- Word validation
- Score calculation with premium squares
- Tile bag randomization
- AI opponent with word-finding algorithm
- Challenge system

**3D Assets** (TODO):
- Wooden board with premium square colors
- Letter tiles with realistic materials
- Tile rack with physics
- Tile bag with draw animation

## Data Flow

### Game Session Flow
```
1. User Authentication (Firebase)
   ↓
2. Lobby/Matchmaking (Backend)
   ↓
3. Game Creation (Backend)
   ↓
4. Real-time State Sync (WebSocket)
   ↓
5. Game Actions (Client → Server → All Clients)
   ↓
6. Game Completion (Save Results to DB)
```

### State Management
- **Client**: React state + Context API
- **Real-time**: WebSocket events
- **Persistent**: PostgreSQL database
- **Cache**: Redis for session data

## API Structure

### REST Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /user/profile` - Get user profile
- `GET /games/history` - Game history
- `POST /games/create` - Create new game
- `GET /leaderboard` - Global rankings

### WebSocket Events
- `game:join` - Join a game room
- `game:action` - Player action
- `game:state` - State update
- `game:chat` - In-game chat
- `player:disconnect` - Handle disconnection
- `player:reconnect` - Handle reconnection

## Performance Considerations

### Web Optimization
- Code splitting by route
- Lazy loading 3D assets
- Asset compression (glTF/Draco)
- Texture atlasing
- Level of detail (LOD) for 3D models

### Mobile Optimization
- Reduced polygon count
- Simplified shaders
- Battery-efficient rendering
- Cached assets for offline play
- Adaptive quality based on device

## Security

- JWT tokens for authentication
- Rate limiting on API endpoints
- Input validation on all actions
- Anti-cheat measures
- Encrypted WebSocket connections (WSS)
- Sanitized user input

## Testing Strategy

- **Unit Tests**: Jest for game logic
- **Integration Tests**: API and WebSocket tests
- **E2E Tests**: Playwright for web, Detox for mobile
- **Visual Tests**: Snapshot testing for UI
- **Performance Tests**: Lighthouse for web

## Deployment Pipeline

### Mobile
1. Build with Expo EAS
2. Submit to App Store (iOS)
3. Submit to Play Store (Android)

### Web
1. Build Next.js production
2. Deploy to Vercel
3. CDN distribution

### Backend
1. Docker containerization
2. Deploy to AWS Fargate
3. Auto-scaling configuration
4. Database migrations

## Future Enhancements

- [ ] Tournament mode
- [ ] Achievements and badges
- [ ] Social features (friends, chat)
- [ ] Replay system
- [ ] Customizable themes/skins
- [ ] Voice chat
- [ ] Streaming/spectator features
- [ ] Additional games (Chess, Checkers, etc.)

## Development Roadmap

### Phase 1: Foundation (Current)
- ✅ Monorepo setup
- ✅ Shared packages structure
- ✅ Poker game engine
- ✅ Type definitions

### Phase 2: Apps & Infrastructure
- [ ] Expo mobile app setup
- [ ] Next.js web app setup
- [ ] Backend with WebSocket
- [ ] Authentication system
- [ ] Database schema

### Phase 3: 3D Graphics
- [ ] Poker 3D components
- [ ] Backgammon 3D components
- [ ] Scrabble 3D components
- [ ] Lighting and materials
- [ ] Animations

### Phase 4: Multiplayer
- [ ] Matchmaking system
- [ ] Real-time sync
- [ ] Game lobby
- [ ] Chat system

### Phase 5: Polish & Launch
- [ ] Sound effects
- [ ] Music
- [ ] Haptic feedback
- [ ] Onboarding
- [ ] Analytics
- [ ] Beta testing
- [ ] App store submission

## Contributing

This is a complex project requiring expertise in:
- React/React Native development
- 3D graphics (Three.js)
- Real-time systems (WebSockets)
- Game development
- Mobile app development
- Backend architecture

Each package is independently testable and can be developed in parallel.

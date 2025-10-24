# Classic Games - World-Class Cross-Platform Gaming Suite

A unified monorepo featuring world-class, graphics-rich implementations of classic card and board games with realistic 3D graphics and online multiplayer.

## 🎮 Games

- **Poker** - Texas Hold'em with realistic 3D cards, chips, and table
- **Backgammon** - Classic board game with physics-based dice and pieces
- **Scrabble** - Word game with tile physics and comprehensive dictionary

## 🏗️ Architecture

This monorepo uses Turborepo to manage:

### Apps
- **mobile/** - React Native + Expo app for iOS and Android
- **web/** - Next.js web application with React Three Fiber
- **backend/** - Node.js server with WebSocket support for multiplayer

### Packages
- **shared-ui/** - Shared React components
- **game-engine/** - Core game logic for all games
- **three-components/** - Reusable 3D components and assets
- **utils/** - Shared utilities and helpers

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run all apps in development mode
npm run dev

# Run specific app
npm run mobile    # Mobile app
npm run web       # Web app
npm run backend   # Backend server
```

## 🛠️ Tech Stack

- **Frontend**: React, React Native, Next.js, TypeScript
- **3D Graphics**: Three.js, React Three Fiber, Expo GL
- **Multiplayer**: WebSocket, Socket.io
- **Authentication**: Firebase Auth
- **State Management**: Zustand
- **Styling**: Tailwind CSS (web), React Native StyleSheet (mobile)
- **Build**: Turborepo, TypeScript
- **Mobile**: Expo (iOS & Android)

## 📱 Features

- ✅ Realistic 3D graphics with physics
- ✅ Cross-platform (iOS, Android, Web)
- ✅ Online multiplayer with matchmaking
- ✅ Real-time synchronization
- ✅ Offline AI opponents
- ✅ Sound effects and music
- ✅ Haptic feedback (mobile)
- ✅ Responsive mobile-first design
- ✅ Progressive Web App (PWA)

## 📦 Project Structure

```
classic-games-monorepo/
├── apps/
│   ├── mobile/          # Expo app
│   ├── web/             # Next.js app
│   └── backend/         # Node.js server
├── packages/
│   ├── shared-ui/       # UI components
│   ├── game-engine/     # Game logic
│   ├── three-components/# 3D components
│   └── utils/           # Utilities
├── turbo.json           # Turborepo config
└── package.json         # Root config
```

## 🎯 Development Roadmap

- [x] Monorepo setup with Turborepo
- [ ] Shared component library
- [ ] Game engine for all three games
- [ ] 3D asset library
- [ ] Mobile app with Expo
- [ ] Web app with Next.js
- [ ] Backend with WebSocket
- [ ] Authentication system
- [ ] Matchmaking and lobbies
- [ ] Real-time multiplayer
- [ ] Sound and haptics
- [ ] App store deployments

## 📄 License

MIT

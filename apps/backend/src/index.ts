import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupGameHandlers } from './socket/gameHandlers.js';
import { setupLobbyHandlers } from './socket/lobbyHandlers.js';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:8081', 'http://192.168.0.184:3002'],
  credentials: true
}));
app.use(express.json());

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3002', 'http://localhost:8081', 'http://192.168.0.184:3002'],
    credentials: true
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints
app.get('/api/stats', (req, res) => {
  res.json({
    activeGames: 0, // TODO: implement game tracking
    onlinePlayers: io.engine.clientsCount,
    uptime: process.uptime()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Set up handlers
  setupLobbyHandlers(io, socket);
  setupGameHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id} - ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start server
const PORT = process.env.PORT || 3004;

httpServer.listen(PORT, () => {
  console.log(`
  🎮 Classic Games Backend Server
  ================================
  🚀 Server running on port ${PORT}
  📡 WebSocket server ready
  🌐 API: http://localhost:${PORT}
  💚 Health: http://localhost:${PORT}/health
  ================================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

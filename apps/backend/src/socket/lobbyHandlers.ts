import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface Room {
  id: string;
  name: string;
  gameType: 'poker' | 'backgammon' | 'scrabble';
  host: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'starting' | 'in_progress';
  createdAt: Date;
}

interface Player {
  id: string;
  socketId: string;
  name: string;
  avatar?: string;
  ready: boolean;
}

// In-memory storage (replace with database in production)
const rooms = new Map<string, Room>();
const players = new Map<string, Player>();

export function setupLobbyHandlers(io: Server, socket: Socket) {

  // Player joins lobby
  socket.on('lobby:join', (data: { playerName: string; avatar?: string }) => {
    const player: Player = {
      id: uuidv4(),
      socketId: socket.id,
      name: data.playerName || `Player${Math.floor(Math.random() * 1000)}`,
      avatar: data.avatar,
      ready: false
    };

    players.set(socket.id, player);
    socket.join('lobby');

    socket.emit('lobby:joined', {
      player,
      rooms: Array.from(rooms.values())
    });

    // Notify others
    socket.to('lobby').emit('lobby:player_joined', player);

    console.log(`Player joined lobby: ${player.name} (${socket.id})`);
  });

  // Create a new game room
  socket.on('room:create', (data: {
    name: string;
    gameType: 'poker' | 'backgammon' | 'scrabble';
    maxPlayers: number;
  }) => {
    const player = players.get(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not found. Please rejoin the lobby.' });
      return;
    }

    const room: Room = {
      id: uuidv4(),
      name: data.name,
      gameType: data.gameType,
      host: socket.id,
      players: [player],
      maxPlayers: data.maxPlayers || 4,
      status: 'waiting',
      createdAt: new Date()
    };

    rooms.set(room.id, room);
    socket.join(room.id);
    socket.leave('lobby');

    socket.emit('room:created', room);
    io.to('lobby').emit('room:list_updated', Array.from(rooms.values()));

    console.log(`Room created: ${room.name} by ${player.name}`);
  });

  // Join an existing room
  socket.on('room:join', (data: { roomId: string }) => {
    const player = players.get(socket.id);
    const room = rooms.get(data.roomId);

    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    room.players.push(player);
    socket.join(room.id);
    socket.leave('lobby');

    socket.emit('room:joined', room);
    io.to(room.id).emit('room:player_joined', { room, player });
    io.to('lobby').emit('room:list_updated', Array.from(rooms.values()));

    console.log(`${player.name} joined room: ${room.name}`);
  });

  // Leave room
  socket.on('room:leave', () => {
    const player = players.get(socket.id);
    if (!player) return;

    // Find room player is in
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          // Delete empty room
          rooms.delete(roomId);
          io.to('lobby').emit('room:list_updated', Array.from(rooms.values()));
        } else {
          // If host left, assign new host
          if (room.host === socket.id) {
            room.host = room.players[0].socketId;
          }
          io.to(roomId).emit('room:player_left', { room, player });
        }

        socket.leave(roomId);
        socket.join('lobby');
        socket.emit('lobby:joined', {
          player,
          rooms: Array.from(rooms.values())
        });

        console.log(`${player.name} left room: ${room.name}`);
        break;
      }
    }
  });

  // Player ready toggle
  socket.on('room:toggle_ready', () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.ready = !player.ready;

    // Find room and broadcast
    for (const [roomId, room] of rooms.entries()) {
      const roomPlayer = room.players.find(p => p.socketId === socket.id);
      if (roomPlayer) {
        roomPlayer.ready = player.ready;
        io.to(roomId).emit('room:player_ready_changed', { player });

        // Check if all players are ready
        const allReady = room.players.every(p => p.ready);
        if (allReady && room.players.length >= 2) {
          io.to(roomId).emit('room:all_ready');
        }
        break;
      }
    }
  });

  // Start game
  socket.on('room:start_game', (data: { roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.host !== socket.id) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }

    room.status = 'starting';
    io.to(room.id).emit('game:starting', {
      roomId: room.id,
      gameType: room.gameType,
      players: room.players
    });

    // Transition to in_progress after countdown
    setTimeout(() => {
      room.status = 'in_progress';
      io.to(room.id).emit('game:started', {
        roomId: room.id,
        gameType: room.gameType
      });
    }, 3000);

    console.log(`Game starting in room: ${room.name}`);
  });

  // Get room list
  socket.on('lobby:get_rooms', () => {
    socket.emit('lobby:rooms', Array.from(rooms.values()));
  });
}

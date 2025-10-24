import { Server, Socket } from 'socket.io';

export function setupGameHandlers(io: Server, socket: Socket) {

  // Game action from player
  socket.on('game:action', (data: {
    roomId: string;
    gameType: string;
    action: any;
  }) => {
    console.log(`Game action in room ${data.roomId}:`, data.action);

    // Broadcast action to all players in room
    socket.to(data.roomId).emit('game:action', {
      playerId: socket.id,
      action: data.action
    });
  });

  // Game state sync
  socket.on('game:sync', (data: {
    roomId: string;
    state: any;
  }) => {
    // Broadcast game state to all players in room
    io.to(data.roomId).emit('game:state_updated', {
      state: data.state,
      timestamp: Date.now()
    });
  });

  // Chat message
  socket.on('game:chat', (data: {
    roomId: string;
    message: string;
  }) => {
    io.to(data.roomId).emit('game:chat_message', {
      playerId: socket.id,
      message: data.message,
      timestamp: Date.now()
    });
  });

  // Game over
  socket.on('game:end', (data: {
    roomId: string;
    results: any;
  }) => {
    io.to(data.roomId).emit('game:ended', {
      results: data.results,
      timestamp: Date.now()
    });

    console.log(`Game ended in room ${data.roomId}`);
  });
}

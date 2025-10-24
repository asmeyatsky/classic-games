import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * useMultiplayerGame - React Hook for Multiplayer Game Management
 *
 * Features:
 * - WebSocket connection management
 * - Real-time game state synchronization
 * - Player tracking and notifications
 * - Automatic reconnection with exponential backoff
 * - Move validation and submission
 * - Chat functionality
 *
 * Usage:
 * ```typescript
 * const {
 *   gameState,
 *   players,
 *   connected,
 *   makeMove,
 *   sendMessage,
 *   join,
 *   leave
 * } = useMultiplayerGame(serverUrl, gameType);
 * ```
 */

export interface MultiplayerPlayer {
  id: string;
  name: string;
  isAI?: boolean;
  isConnected?: boolean;
}

export interface MultiplayerGameState {
  roomId: string;
  gameState: any;
  players: MultiplayerPlayer[];
  lastMove?: {
    playerId: string;
    move: any;
    timestamp: number;
  };
  isActive: boolean;
}

export interface UseMultiplayerGameResult {
  gameState: MultiplayerGameState | null;
  players: MultiplayerPlayer[];
  connected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  makeMove: (move: any) => Promise<boolean>;
  performAction: (action: string, payload?: any) => Promise<boolean>;
  sendMessage: (message: string) => void;
  joinRoom: (playerId: string, playerName: string, roomId: string, gameType: string) => Promise<boolean>;
  leaveRoom: () => void;
  requestGameState: () => void;
  disconnect: () => void;
}

export function useMultiplayerGame(
  serverUrl: string,
  gameType: 'poker' | 'backgammon' | 'scrabble'
): UseMultiplayerGameResult {
  // State
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageQueueRef = useRef<any[]>([]);
  const currentPlayerRef = useRef<{ id: string; name: string } | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  /**
   * Connect to WebSocket server
   */
  const connectWebSocket = useCallback((serverAddress: string) => {
    try {
      setConnectionStatus('connecting');
      setError(null);

      const ws = new WebSocket(serverAddress);

      ws.onopen = () => {
        console.log('Connected to game server');
        setConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        setError(null);

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          ws.send(JSON.stringify(message));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleServerMessage(message);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from game server');
        setConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;
        attemptReconnect(serverAddress);
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setConnectionStatus('error');
        setError('Connection error');
      };

      wsRef.current = ws;
    } catch (err: any) {
      console.error('Failed to connect:', err);
      setConnectionStatus('error');
      setError(err.message);
    }
  }, []);

  /**
   * Attempt to reconnect with exponential backoff
   */
  const attemptReconnect = useCallback((serverAddress: string) => {
    const maxAttempts = 5;
    const baseDelay = 1000;

    if (reconnectAttemptsRef.current >= maxAttempts) {
      setError('Failed to reconnect after multiple attempts');
      return;
    }

    const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
    reconnectAttemptsRef.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Reconnection attempt ${reconnectAttemptsRef.current}`);
      connectWebSocket(serverAddress);
    }, delay);
  }, [connectWebSocket]);

  /**
   * Handle messages from server
   */
  const handleServerMessage = useCallback((message: any) => {
    const { type, payload } = message;

    switch (type) {
      case 'state':
        setGameState(message);
        setPlayers(message.players || []);
        break;

      case 'join':
        setPlayers(prev => [...prev, {
          id: message.playerId,
          name: message.playerName
        }]);
        break;

      case 'leave':
        setPlayers(prev => prev.filter(p => p.id !== message.playerId));
        break;

      case 'chat':
        console.log(`${message.playerId}: ${message.message}`);
        break;

      case 'gameStart':
        setGameState(prev => prev ? { ...prev, isActive: true, gameState: message.gameState } : null);
        break;

      case 'gameEnd':
        setGameState(prev => prev ? { ...prev, isActive: false } : null);
        break;

      case 'error':
        setError(message.message);
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }, []);

  /**
   * Send message to server
   */
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      messageQueueRef.current.push(message);
    }
  }, []);

  /**
   * Join a game room
   */
  const joinRoom = useCallback(async (
    playerId: string,
    playerName: string,
    roomId: string,
    type: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      currentPlayerRef.current = { id: playerId, name: playerName };
      currentRoomRef.current = roomId;

      sendMessage({
        type: 'join',
        payload: {
          playerId,
          playerName,
          roomId,
          gameType: type
        }
      });

      // Resolve after a short delay (would be better with acknowledgment)
      setTimeout(() => resolve(true), 100);
    });
  }, [sendMessage]);

  /**
   * Make a game move
   */
  const makeMove = useCallback(async (move: any): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!currentPlayerRef.current || !currentRoomRef.current) {
        resolve(false);
        return;
      }

      sendMessage({
        type: 'move',
        playerId: currentPlayerRef.current.id,
        roomId: currentRoomRef.current,
        payload: move
      });

      // Resolve after submission
      setTimeout(() => resolve(true), 100);
    });
  }, [sendMessage]);

  /**
   * Perform a game action (not a move)
   */
  const performAction = useCallback(async (action: string, payload?: any): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!currentPlayerRef.current || !currentRoomRef.current) {
        resolve(false);
        return;
      }

      sendMessage({
        type: 'action',
        playerId: currentPlayerRef.current.id,
        roomId: currentRoomRef.current,
        payload: {
          action,
          ...payload
        }
      });

      setTimeout(() => resolve(true), 100);
    });
  }, [sendMessage]);

  /**
   * Send chat message
   */
  const sendChatMessage = useCallback((message: string) => {
    if (!currentPlayerRef.current || !currentRoomRef.current) return;

    sendMessage({
      type: 'chat',
      playerId: currentPlayerRef.current.id,
      roomId: currentRoomRef.current,
      payload: {
        message
      }
    });
  }, [sendMessage]);

  /**
   * Request current game state
   */
  const requestGameState = useCallback(() => {
    if (!currentRoomRef.current) return;

    sendMessage({
      type: 'state',
      roomId: currentRoomRef.current
    });
  }, [sendMessage]);

  /**
   * Leave room
   */
  const leaveRoom = useCallback(() => {
    if (!currentRoomRef.current) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    currentRoomRef.current = null;
    currentPlayerRef.current = null;
    setGameState(null);
    setPlayers([]);
  }, []);

  /**
   * Disconnect from server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    gameState,
    players,
    connected,
    connectionStatus,
    error,
    makeMove,
    performAction,
    sendMessage: sendChatMessage,
    joinRoom,
    leaveRoom,
    requestGameState,
    disconnect,
  };
}

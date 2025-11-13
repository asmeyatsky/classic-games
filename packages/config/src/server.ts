/**
 * Server Configuration and Constants
 */

export const SERVER_CONFIG = {
  /**
   * Server Ports
   */
  PORTS: {
    DEVELOPMENT: 3001,
    PRODUCTION: 3001,
    WEB: 3000,
    MOBILE: 8081,
  },

  /**
   * WebSocket Configuration
   */
  WEBSOCKET: {
    RECONNECT_INTERVAL: 1000,
    RECONNECT_MAX_RETRIES: 5,
    RECONNECT_BACKOFF: 2,
    PING_INTERVAL: 30000,
    PING_TIMEOUT: 5000,
    MESSAGE_QUEUE_TIMEOUT: 10000,
  },

  /**
   * Game Server Configuration
   */
  GAME_SERVER: {
    MAX_ROOMS: 1000,
    MAX_PLAYERS_PER_ROOM: 6,
    ROOM_IDLE_TIMEOUT: 3600000, // 1 hour
    GAME_TIMEOUT: 600000, // 10 minutes
    MOVE_TIMEOUT: 60000, // 1 minute
  },

  /**
   * Database Configuration
   */
  DATABASE: {
    POOL_SIZE: 20,
    IDLE_TIMEOUT: 30000,
    CONNECTION_TIMEOUT: 5000,
    QUERY_TIMEOUT: 30000,
  },

  /**
   * Rate Limiting
   */
  RATE_LIMIT: {
    WINDOW_MS: 60000, // 1 minute
    MAX_REQUESTS: 100,
    MESSAGE_RATE: 10, // messages per second
    MOVE_RATE: 5, // moves per second
  },

  /**
   * Session Configuration
   */
  SESSION: {
    TIMEOUT: 1800000, // 30 minutes
    REFRESH_INTERVAL: 600000, // 10 minutes
    SECURE: true,
    HTTP_ONLY: true,
    SAME_SITE: 'Strict',
  },

  /**
   * CORS Configuration
   */
  CORS: {
    ALLOWED_ORIGINS: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
    CREDENTIALS: true,
  },

  /**
   * Logging Configuration
   */
  LOGGING: {
    LEVEL: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    FORMAT: 'json',
    MAX_FILE_SIZE: 10485760, // 10MB
    MAX_FILES: 14, // 2 weeks at daily rotation
    LOG_REQUESTS: true,
    LOG_ERRORS: true,
  },

  /**
   * Security Headers
   */
  SECURITY: {
    HELMET_ENABLED: true,
    HSTS_MAX_AGE: 31536000, // 1 year
    HSTS_INCLUDE_SUBDOMAINS: true,
    HSTS_PRELOAD: true,
    CONTENT_SECURITY_POLICY: {
      ENABLED: true,
      REPORT_ONLY: false,
    },
  },

  /**
   * API Response Configuration
   */
  API: {
    MAX_REQUEST_SIZE: '10mb',
    DEFAULT_TIMEOUT: 30000,
    CACHE_DURATION: 300000, // 5 minutes
  },
} as const;

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

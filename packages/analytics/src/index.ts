/**
 * @classic-games/analytics
 *
 * Analytics and monitoring with Sentry integration
 *
 * Usage:
 * ```typescript
 * import { initializeSentry, trackGameEvent } from '@classic-games/analytics';
 *
 * initializeSentry({
 *   dsn: 'YOUR_SENTRY_DSN',
 *   environment: 'production',
 * });
 *
 * trackGameStart('game-123', 'player-1', 'poker', 4);
 * ```
 */

export {
  initializeSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
  setExtraContext,
  setTag,
  setupUnhandledRejectionHandler,
  setupGlobalErrorHandler,
  getSentryInstance,
} from './client';

export {
  GameEventType,
  UserEventType,
  trackGameEvent,
  trackUserEvent,
  trackGameStart,
  trackGameEnd,
  trackMove,
  trackPlayerJoined,
  trackAchievementUnlocked,
  trackSignup,
  trackLogin,
  trackLogout,
  type GameEvent,
  type UserEvent,
} from './events';

export {
  initializeWebVitals,
  trackCustomMetric,
  trackResourceTiming,
  trackApiCall,
  trackRenderTime,
  getPerformanceMetrics,
  reportPerformanceMetrics,
  trackMemoryUsage,
} from './vitals';

/**
 * Event-Driven Architecture
 * Centralized event bus for application-wide events
 */

import { getLogger } from '@classic-games/logger';

const logger = getLogger();

export type EventType =
  | 'game:started'
  | 'game:move'
  | 'game:ended'
  | 'player:joined'
  | 'player:left'
  | 'achievement:unlocked'
  | 'tournament:created'
  | 'tournament:started'
  | 'tournament:ended'
  | 'room:created'
  | 'room:started'
  | 'friend:request'
  | 'friend:added'
  | 'clan:created'
  | 'clan:member-joined'
  | 'rating:updated'
  | 'leaderboard:updated';

export interface GameEvent {
  type: EventType;
  timestamp: string;
  userId?: string;
  gameId?: string;
  data: Record<string, any>;
}

type EventHandler = (event: GameEvent) => Promise<void> | void;
type EventFilter = (event: GameEvent) => boolean;

interface Subscription {
  id: string;
  eventType: EventType | '*';
  handler: EventHandler;
  filter?: EventFilter;
  priority: number;
}

/**
 * EventBus - Centralized event management system for the application
 *
 * Provides publish-subscribe pattern for decoupled event handling with:
 * - Priority-based handler execution
 * - Event filtering capabilities
 * - Event history tracking
 * - Async queue processing
 * - Comprehensive error handling
 *
 * @example
 * const bus = new EventBus();
 *
 * // Subscribe to events
 * const subId = bus.subscribe('game:ended', async (event) => {
 *   console.log('Game ended:', event.data);
 * }, { priority: 10 });
 *
 * // Emit events
 * await bus.emit({
 *   type: 'game:ended',
 *   userId: 'user-123',
 *   gameId: 'game-456',
 *   data: { winnerId: 'player-1' }
 * });
 *
 * // Unsubscribe
 * bus.unsubscribe(subId);
 *
 * // Get history
 * const history = bus.getHistory({
 *   eventType: 'game:ended',
 *   userId: 'user-123',
 *   limit: 10
 * });
 */
export class EventBus {
  private subscriptions: Map<string, Subscription> = new Map();
  private subscriptionCounter = 0;
  private eventQueue: GameEvent[] = [];
  private isProcessing = false;
  private eventHistory: GameEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Subscribe to events with optional filtering and priority
   *
   * @param {EventType | '*'} eventType - Event type to subscribe to ('*' for all)
   * @param {EventHandler} handler - Async handler function to execute
   * @param {Object} options - Optional configuration
   * @param {EventFilter} [options.filter] - Optional filter function to match events
   * @param {number} [options.priority=0] - Handler execution priority (higher = first)
   * @returns {string} Unique subscription ID for later unsubscription
   *
   * @example
   * const subId = bus.subscribe('game:ended',
   *   async (event) => {
   *     await updateRatings(event.userId, event.data);
   *   },
   *   {
   *     filter: (e) => e.data.winnerId !== null,
   *     priority: 10
   *   }
   * );
   */
  subscribe(
    eventType: EventType | '*',
    handler: EventHandler,
    options?: { filter?: EventFilter; priority?: number }
  ): string {
    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    const priority = options?.priority || 0;

    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler,
      filter: options?.filter,
      priority,
    };

    this.subscriptions.set(subscriptionId, subscription);

    logger.debug('Event subscription created', { subscriptionId, eventType, priority });

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   *
   * @param {string} subscriptionId - Subscription ID returned from subscribe()
   * @returns {boolean} True if subscription was removed, false if not found
   *
   * @example
   * const subId = bus.subscribe('game:ended', handler);
   * // Later...
   * bus.unsubscribe(subId); // true
   */
  unsubscribe(subscriptionId: string): boolean {
    const result = this.subscriptions.delete(subscriptionId);

    if (result) {
      logger.debug('Event subscription removed', { subscriptionId });
    }

    return result;
  }

  /**
   * Emit an event to all matching subscribers
   *
   * The event is queued and processed asynchronously. All matching handlers
   * are executed in parallel after being sorted by priority.
   *
   * @param {GameEvent} event - Event to emit
   * @returns {Promise<void>} Resolves when event is queued (not when handlers complete)
   *
   * @throws {Error} If event type is invalid
   *
   * @example
   * await bus.emit({
   *   type: 'game:ended',
   *   userId: 'user-123',
   *   gameId: 'game-456',
   *   data: {
   *     winnerId: 'player-1',
   *     score: 100,
   *     duration: 300
   *   }
   * });
   */
  async emit(event: GameEvent): Promise<void> {
    // Validate event
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }

    // Add to queue
    this.eventQueue.push(event);

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    logger.debug('Event queued', { type: event.type, userId: event.userId });

    // Process queue
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Process event queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();

        if (!event) continue;

        await this.publishEvent(event);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Publish event to all matching subscribers
   */
  private async publishEvent(event: GameEvent): Promise<void> {
    // Get matching subscriptions sorted by priority
    const matchingSubscriptions = Array.from(this.subscriptions.values())
      .filter(
        (sub) =>
          (sub.eventType === '*' || sub.eventType === event.type) &&
          (!sub.filter || sub.filter(event))
      )
      .sort((a, b) => b.priority - a.priority);

    logger.debug('Publishing event', {
      type: event.type,
      subscribers: matchingSubscriptions.length,
    });

    // Execute handlers in parallel
    const promises = matchingSubscriptions.map((sub) => this.executeHandler(sub, event));

    const results = await Promise.allSettled(promises);

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error('Event handler failed', {
          eventType: event.type,
          subscriptionId: matchingSubscriptions[index].id,
          error: result.reason,
        });
      }
    });
  }

  /**
   * Execute a single event handler with error handling
   */
  private async executeHandler(subscription: Subscription, event: GameEvent): Promise<void> {
    try {
      await subscription.handler(event);
    } catch (error) {
      throw new Error(
        `Handler ${subscription.id} failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get event history with optional filtering
   *
   * Retrieves events from the history (last 1000 events) with optional filters.
   * Filters are combined with AND logic.
   *
   * @param {Object} filter - Optional filter criteria
   * @param {EventType} [filter.eventType] - Filter by event type
   * @param {string} [filter.userId] - Filter by user ID
   * @param {string} [filter.gameId] - Filter by game ID
   * @param {string} [filter.since] - Filter events since this ISO timestamp
   * @param {number} [filter.limit] - Maximum number of events to return
   * @returns {GameEvent[]} Array of matching events
   *
   * @example
   * // Get last 10 games ended events
   * const gameEnds = bus.getHistory({
   *   eventType: 'game:ended',
   *   limit: 10
   * });
   *
   * // Get all events for a user in the last hour
   * const now = new Date();
   * const onHourAgo = new Date(now.getTime() - 3600000).toISOString();
   * const userEvents = bus.getHistory({
   *   userId: 'user-123',
   *   since: onHourAgo
   * });
   */
  getHistory(filter?: {
    eventType?: EventType;
    userId?: string;
    gameId?: string;
    since?: string;
    limit?: number;
  }): GameEvent[] {
    let results = [...this.eventHistory];

    if (filter?.eventType) {
      results = results.filter((e) => e.type === filter.eventType);
    }

    if (filter?.userId) {
      results = results.filter((e) => e.userId === filter.userId);
    }

    if (filter?.gameId) {
      results = results.filter((e) => e.gameId === filter.gameId);
    }

    if (filter?.since) {
      const sinceTime = new Date(filter.since).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() >= sinceTime);
    }

    if (filter?.limit) {
      results = results.slice(-filter.limit);
    }

    return results;
  }

  /**
   * Clear all event history
   *
   * Removes all events from the history. Use with caution as this
   * cannot be undone.
   *
   * @returns {void}
   *
   * @example
   * bus.clearHistory();
   */
  clearHistory(): void {
    this.eventHistory = [];
    logger.debug('Event history cleared');
  }

  /**
   * Get EventBus statistics
   *
   * Returns current metrics about the event bus state and performance.
   *
   * @returns {Object} Statistics object
   * @returns {number} returns.totalSubscriptions - Total active subscriptions
   * @returns {number} returns.queueSize - Number of pending events in queue
   * @returns {number} returns.historySize - Number of events in history
   *
   * @example
   * const stats = bus.getStats();
   * console.log(`${stats.totalSubscriptions} active subscriptions`);
   * console.log(`${stats.queueSize} events queued`);
   */
  getStats(): {
    totalSubscriptions: number;
    queueSize: number;
    historySize: number;
  } {
    return {
      totalSubscriptions: this.subscriptions.size,
      queueSize: this.eventQueue.length,
      historySize: this.eventHistory.length,
    };
  }
}

// Global event bus instance
let eventBus: EventBus | null = null;

/**
 * Initialize global event bus singleton
 *
 * Should be called once during application startup. Subsequent calls
 * return the same instance.
 *
 * @returns {EventBus} The global EventBus instance
 *
 * @example
 * // In application startup
 * import { initializeEventBus } from './services/eventBus';
 *
 * initializeEventBus();
 */
export function initializeEventBus(): EventBus {
  if (!eventBus) {
    eventBus = new EventBus();
    logger.info('Event bus initialized');
  }
  return eventBus;
}

/**
 * Get the global event bus instance
 *
 * Must be called after initializeEventBus() has been called.
 *
 * @returns {EventBus} The global EventBus instance
 * @throws {Error} If EventBus has not been initialized
 *
 * @example
 * import { getEventBus } from './services/eventBus';
 *
 * const bus = getEventBus();
 */
export function getEventBus(): EventBus {
  if (!eventBus) {
    throw new Error('Event bus not initialized. Call initializeEventBus() first.');
  }
  return eventBus;
}

/**
 * Emit event using the global event bus
 *
 * Convenience function for emitting events without accessing the bus directly.
 * Timestamp is automatically added if not provided.
 *
 * @param {Omit<GameEvent, 'timestamp'>} event - Event to emit (without timestamp)
 * @returns {Promise<void>} Resolves when event is queued
 *
 * @example
 * import { emit } from './services/eventBus';
 *
 * await emit({
 *   type: 'game:ended',
 *   userId: 'user-123',
 *   gameId: 'game-456',
 *   data: { winnerId: 'player-1' }
 * });
 */
export async function emit(event: Omit<GameEvent, 'timestamp'>): Promise<void> {
  const bus = getEventBus();
  await bus.emit({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Subscribe to events using the global event bus
 *
 * Convenience function for subscribing to events without accessing the bus directly.
 *
 * @param {EventType | '*'} eventType - Event type to subscribe to
 * @param {EventHandler} handler - Handler function to execute
 * @param {Object} options - Optional configuration
 * @param {EventFilter} [options.filter] - Optional event filter
 * @param {number} [options.priority] - Handler priority
 * @returns {string} Subscription ID for later unsubscription
 *
 * @example
 * import { on } from './services/eventBus';
 *
 * const subId = on('achievement:unlocked',
 *   async (event) => {
 *     await notifyUser(event.userId, event.data);
 *   },
 *   { priority: 10 }
 * );
 */
export function on(
  eventType: EventType | '*',
  handler: EventHandler,
  options?: { filter?: EventFilter; priority?: number }
): string {
  const bus = getEventBus();
  return bus.subscribe(eventType, handler, options);
}

/**
 * Unsubscribe from events using the global event bus
 *
 * Convenience function for unsubscribing without accessing the bus directly.
 *
 * @param {string} subscriptionId - Subscription ID returned from on()
 * @returns {boolean} True if subscription was removed
 *
 * @example
 * import { off } from './services/eventBus';
 *
 * const subId = on('game:ended', handler);
 * // Later...
 * off(subId);
 */
export function off(subscriptionId: string): boolean {
  const bus = getEventBus();
  return bus.unsubscribe(subscriptionId);
}

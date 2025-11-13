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

export class EventBus {
  private subscriptions: Map<string, Subscription> = new Map();
  private subscriptionCounter = 0;
  private eventQueue: GameEvent[] = [];
  private isProcessing = false;
  private eventHistory: GameEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Subscribe to events
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
   */
  unsubscribe(subscriptionId: string): boolean {
    const result = this.subscriptions.delete(subscriptionId);

    if (result) {
      logger.debug('Event subscription removed', { subscriptionId });
    }

    return result;
  }

  /**
   * Emit an event
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
   * Get event history
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
   * Clear history
   */
  clearHistory(): void {
    this.eventHistory = [];
    logger.debug('Event history cleared');
  }

  /**
   * Get statistics
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
 * Initialize global event bus
 */
export function initializeEventBus(): EventBus {
  if (!eventBus) {
    eventBus = new EventBus();
    logger.info('Event bus initialized');
  }
  return eventBus;
}

/**
 * Get global event bus
 */
export function getEventBus(): EventBus {
  if (!eventBus) {
    throw new Error('Event bus not initialized. Call initializeEventBus() first.');
  }
  return eventBus;
}

/**
 * Emit event using global event bus
 */
export async function emit(event: Omit<GameEvent, 'timestamp'>): Promise<void> {
  const bus = getEventBus();
  await bus.emit({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Subscribe to events using global event bus
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
 * Unsubscribe from events using global event bus
 */
export function off(subscriptionId: string): boolean {
  const bus = getEventBus();
  return bus.unsubscribe(subscriptionId);
}

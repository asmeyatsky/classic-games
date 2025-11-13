/**
 * Client-Side Analytics and Error Tracking with Sentry
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { getLogger } from '@classic-games/logger';

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  maxBreadcrumbs?: number;
}

/**
 * Initialize Sentry for client-side error tracking
 */
export function initializeSentry(config: SentryConfig): void {
  try {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: config.tracesSampleRate || 0.1,
      replaysSessionSampleRate: config.replaysSessionSampleRate || 0.1,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate || 1.0,
      maxBreadcrumbs: config.maxBreadcrumbs || 50,
      beforeSend: (event) => {
        // Filter out certain errors if needed
        if (event.exception) {
          const error = event.exception.values?.[0];
          // Don't send network timeout errors
          if (error?.type === 'TimeoutError') {
            return null;
          }
        }
        return event;
      },
    });

    getLogger().info('Sentry initialized for client');
  } catch (error) {
    getLogger().error('Failed to initialize Sentry', error);
  }
}

/**
 * Capture exception in Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value as Record<string, unknown>);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture message in Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, username?: string): void {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for activity tracking
 */
export function addBreadcrumb(
  message: string,
  category: string = 'user-action',
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string = 'operation') {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Set extra context data
 */
export function setExtraContext(key: string, value: unknown): void {
  Sentry.setContext(key, value as Record<string, unknown>);
}

/**
 * Add tag for filtering in Sentry
 */
export function setTag(key: string, value: string | number | boolean): void {
  Sentry.setTag(key, value);
}

/**
 * Report unhandled rejection
 */
export function setupUnhandledRejectionHandler(): void {
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
  });
}

/**
 * Setup global error handler
 */
export function setupGlobalErrorHandler(): void {
  window.addEventListener('error', (event) => {
    Sentry.captureException(event.error);
  });
}

/**
 * Get Sentry instance for advanced usage
 */
export function getSentryInstance() {
  return Sentry;
}

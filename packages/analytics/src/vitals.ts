/**
 * Web Vitals Monitoring
 *
 * Track Core Web Vitals and custom metrics
 */

import {
  getCLS,
  getFCP,
  getFID,
  getLCP,
  getTTFB,
  Metric,
  ReportHandler,
} from 'web-vitals';
import { addBreadcrumb, captureMessage, setExtraContext } from './client';
import { getLogger } from '@classic-games/logger';

interface VitalsThresholds {
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  lcp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

// Google's recommended thresholds
const defaultThresholds: VitalsThresholds = {
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  fid: { good: 100, needsImprovement: 300 },
  lcp: { good: 2500, needsImprovement: 4000 },
  ttfb: { good: 600, needsImprovement: 1200 },
};

/**
 * Get rating based on metric value and thresholds
 */
function getRating(
  metricName: string,
  value: number,
  thresholds: VitalsThresholds
): 'good' | 'needs-improvement' | 'poor' {
  const key = metricName.toLowerCase() as keyof VitalsThresholds;
  const threshold = thresholds[key];

  if (!threshold) return 'poor';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Initialize Web Vitals monitoring
 */
export function initializeWebVitals(thresholds: VitalsThresholds = defaultThresholds): void {
  const logger = getLogger();

  const handler: ReportHandler = (metric: Metric) => {
    const rating = getRating(metric.name, metric.value, thresholds);

    logger.logPerformance(metric.name, metric.value, {
      rating,
      id: metric.id,
    });

    // Add breadcrumb for Sentry
    addBreadcrumb(`Web Vital: ${metric.name}`, 'web-vital', {
      value: metric.value,
      rating,
      unit: metric.rating === 'good' ? 'good' : 'needs-improvement',
    });

    // Report poor vitals
    if (rating === 'poor') {
      captureMessage(
        `${metric.name} is poor: ${metric.value}`,
        'warning'
      );
    }

    // Set extra context
    setExtraContext('web_vitals', {
      [metric.name]: {
        value: metric.value,
        rating,
        id: metric.id,
      },
    });
  };

  // Register all vitals
  getCLS(handler);
  getFCP(handler);
  getFID(handler);
  getLCP(handler);
  getTTFB(handler);

  logger.info('Web Vitals monitoring initialized');
}

/**
 * Track custom metric
 */
export function trackCustomMetric(
  name: string,
  value: number,
  unit: string = 'ms'
): void {
  const logger = getLogger();

  logger.logPerformance(name, value, { unit });

  addBreadcrumb(`Custom Metric: ${name}`, 'custom-metric', {
    value,
    unit,
  });
}

/**
 * Track resource timing
 */
export function trackResourceTiming(resourceName: string, duration: number): void {
  trackCustomMetric(`resource:${resourceName}`, duration, 'ms');
}

/**
 * Track API call performance
 */
export function trackApiCall(endpoint: string, method: string, duration: number, statusCode: number): void {
  const logger = getLogger();

  logger.logResponse(method, endpoint, statusCode, duration);

  const isError = statusCode >= 400;
  addBreadcrumb(`API: ${method} ${endpoint}`, 'api-call', {
    statusCode,
    duration,
  });

  if (isError) {
    captureMessage(`API error: ${method} ${endpoint} returned ${statusCode}`, 'warning');
  }
}

/**
 * Track render time
 */
export function trackRenderTime(componentName: string, duration: number): void {
  trackCustomMetric(`render:${componentName}`, duration, 'ms');
}

/**
 * Get performance metrics summary
 */
export function getPerformanceMetrics(): Record<string, number> {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  const metrics: Record<string, number> = {
    dns: navigation?.domainLookupEnd - navigation?.domainLookupStart || 0,
    tcp: navigation?.connectEnd - navigation?.connectStart || 0,
    ttfb: navigation?.responseStart - navigation?.requestStart || 0,
    download: navigation?.responseEnd - navigation?.responseStart || 0,
    domInteractive: navigation?.domInteractive - navigation?.fetchStart || 0,
    domComplete: navigation?.domComplete - navigation?.fetchStart || 0,
    loadComplete: navigation?.loadEventEnd - navigation?.fetchStart || 0,
  };

  paint.forEach((entry) => {
    metrics[entry.name] = entry.startTime;
  });

  return metrics;
}

/**
 * Report performance metrics
 */
export function reportPerformanceMetrics(): void {
  const logger = getLogger();
  const metrics = getPerformanceMetrics();

  logger.info('Performance metrics', metrics);
  setExtraContext('performance', metrics);
}

/**
 * Track memory usage (if available)
 */
export function trackMemoryUsage(): void {
  if ((performance as any).memory) {
    const memory = (performance as any).memory;
    const logger = getLogger();

    logger.debug('Memory usage', {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    });
  }
}

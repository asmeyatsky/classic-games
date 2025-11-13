/**
 * Global setup for E2E tests
 * Handles database reset and test data initialization
 */

import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup function
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.use;

  if (!baseURL) {
    console.error('Base URL not configured');
    process.exit(1);
  }

  // Wait for API to be ready
  let retries = 30;
  while (retries > 0) {
    try {
      const response = await fetch(`${baseURL}/health`);
      if (response.ok) {
        console.log('API is ready');
        break;
      }
    } catch (e) {
      retries--;
      if (retries > 0) {
        console.log(`Waiting for API... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.error('API failed to start');
        process.exit(1);
      }
    }
  }

  console.log('Global setup completed');
}

export default globalSetup;

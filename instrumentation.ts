/**
 * Next.js Instrumentation file.
 * Initializes Sentry on the server side (Node.js and Edge runtimes).
 * This file is automatically picked up by Next.js 15+.
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;

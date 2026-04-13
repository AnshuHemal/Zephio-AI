import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring in production.
  // Increase to 1.0 (100%) during initial setup to verify it's working.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Capture 100% of replays for sessions with errors, 1% otherwise.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.01,

  // Only enable Replay in production to avoid noise in development.
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and inputs by default for privacy
      maskAllText: true,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Don't send errors in development — use console instead
  enabled: process.env.NODE_ENV === "production",

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // Network errors that are user-side
    "NetworkError",
    "Failed to fetch",
    "Load failed",
    // Cancelled requests
    "AbortError",
    "The user aborted a request",
  ],

  beforeSend(event) {
    // Strip sensitive data from breadcrumbs
    if (event.breadcrumbs?.values) {
      event.breadcrumbs.values = event.breadcrumbs.values.map((crumb) => {
        if (crumb.data?.url) {
          // Remove query params that might contain tokens
          try {
            const url = new URL(crumb.data.url);
            url.search = "";
            crumb.data.url = url.toString();
          } catch { /* not a valid URL */ }
        }
        return crumb;
      });
    }
    return event;
  },
});

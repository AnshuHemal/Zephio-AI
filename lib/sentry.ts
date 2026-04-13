/**
 * Typed Sentry helpers for Zephio.
 *
 * Use these instead of calling Sentry directly so we have
 * a single place to add context, scrubbing, and filtering.
 */

import * as Sentry from "@sentry/nextjs";

// ── User context ──────────────────────────────────────────────────────────────

/**
 * Set the current user on all subsequent Sentry events.
 * Call this after successful authentication.
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  name?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

/**
 * Clear the Sentry user context on sign-out.
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

// ── Error capture ─────────────────────────────────────────────────────────────

/**
 * Capture an error with optional extra context.
 * Returns the Sentry event ID for reference.
 */
export function captureError(
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
  }
): string {
  return Sentry.captureException(error, {
    level: context?.level ?? "error",
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Capture a message (non-error event) with context.
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  extra?: Record<string, unknown>
): string {
  return Sentry.captureMessage(message, { level, extra });
}

// ── Breadcrumbs ───────────────────────────────────────────────────────────────

/**
 * Add a breadcrumb to the current Sentry scope.
 * Breadcrumbs appear in the event timeline to show what led to an error.
 */
export function addBreadcrumb(opts: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}) {
  Sentry.addBreadcrumb({
    message: opts.message,
    category: opts.category ?? "app",
    level: opts.level ?? "info",
    data: opts.data,
    timestamp: Date.now() / 1000,
  });
}

// ── Performance ───────────────────────────────────────────────────────────────

/**
 * Wrap an async function in a Sentry span for performance monitoring.
 *
 * @example
 * const result = await withSpan("ai.generation", async () => {
 *   return await runGenerationWorker(...)
 * })
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return Sentry.startSpan({ name, attributes }, fn);
}

// ── Domain-specific helpers ───────────────────────────────────────────────────

/**
 * Capture a generation error with full context.
 * Used in the API route when AI generation fails.
 */
export function captureGenerationError(
  error: unknown,
  context: {
    userId: string;
    slugId: string;
    intent: string;
    pageCount?: number;
  }
) {
  captureError(error, {
    tags: {
      feature: "generation",
      intent: context.intent,
    },
    extra: {
      userId: context.userId,
      slugId: context.slugId,
      pageCount: context.pageCount,
    },
    level: "error",
  });
}

/**
 * Capture an auth error with context.
 */
export function captureAuthError(
  error: unknown,
  context: { action: "sign_in" | "sign_up" | "verify_email"; email?: string }
) {
  captureError(error, {
    tags: { feature: "auth", action: context.action },
    extra: { emailDomain: context.email?.split("@")[1] }, // don't log full email
    level: "warning",
  });
}

/**
 * Server-side PostHog analytics — API routes and Server Actions only.
 * NEVER import this file from a client component.
 */

if (typeof window !== "undefined") {
  throw new Error("analytics.server.ts must only be used on the server.");
}


import { PostHog } from "posthog-node";
import type { AnalyticsEvents, EventName } from "./analytics";

let _serverClient: PostHog | null = null;

function getServerClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!_serverClient) {
    _serverClient = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,   // flush immediately in serverless
      flushInterval: 0,
    });
  }
  return _serverClient;
}

/**
 * captureServerEvent — fire a typed analytics event from a server context.
 * Safe to call from API routes, Server Actions, and middleware.
 * Failures are silently swallowed so they never affect the user.
 */
export async function captureServerEvent<E extends EventName>(
  userId: string,
  event: E,
  properties: AnalyticsEvents[E]
): Promise<void> {
  try {
    const client = getServerClient();
    if (!client) return;
    client.capture({ distinctId: userId, event, properties });
    await client.flush();
  } catch {
    // Never let analytics crash the app
  }
}

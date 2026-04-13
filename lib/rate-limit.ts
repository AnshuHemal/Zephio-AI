/**
 * In-memory sliding window rate limiter for Next.js App Router.
 *
 * Works in both Node.js and Edge runtimes.
 * Uses a Map to store request timestamps per key (userId or IP).
 *
 * NOTE: In a multi-instance deployment (e.g. multiple Vercel serverless
 * functions), each instance has its own Map. For true distributed rate
 * limiting, replace the store with Redis (Upstash is the easiest option).
 * For most early-stage apps, per-instance limiting is sufficient.
 */

type WindowEntry = {
  timestamps: number[];
  blockedUntil?: number;
};

// Global store — persists across requests within the same process
const store = new Map<string, WindowEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove entries with no recent timestamps and no active block
      if (
        entry.timestamps.length === 0 &&
        (!entry.blockedUntil || entry.blockedUntil < now)
      ) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export type RateLimitConfig = {
  /** Unique key for this limiter (e.g. "generation", "api") */
  id: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Optional: block duration after limit exceeded (default: windowMs) */
  blockDurationMs?: number;
};

export type RateLimitResult =
  | { success: true; remaining: number; resetAt: number }
  | { success: false; retryAfter: number; resetAt: number };

/**
 * Check and record a request for a given key.
 * Returns success=true if the request is allowed, false if rate limited.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const storeKey = `${config.id}:${key}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(storeKey);

  // Check if currently blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      success: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      resetAt: entry.blockedUntil,
    };
  }

  if (!entry) {
    entry = { timestamps: [] };
    store.set(storeKey, entry);
  }

  // Slide the window — remove timestamps older than windowStart
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.limit) {
    // Limit exceeded — set block
    const blockDuration = config.blockDurationMs ?? config.windowMs;
    entry.blockedUntil = now + blockDuration;
    return {
      success: false,
      retryAfter: Math.ceil(blockDuration / 1000),
      resetAt: entry.blockedUntil,
    };
  }

  // Allow — record this request
  entry.timestamps.push(now);
  const remaining = config.limit - entry.timestamps.length;
  const oldestTimestamp = entry.timestamps[0] ?? now;
  const resetAt = oldestTimestamp + config.windowMs;

  return { success: true, remaining, resetAt };
}

// ── Pre-configured limiters ───────────────────────────────────────────────────

/**
 * Per-user generation limiter.
 * Max 5 generations per minute per user.
 * Prevents a single user from hammering the expensive AI endpoints.
 */
export const generationLimiter: RateLimitConfig = {
  id: "generation",
  limit: 5,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 60 * 1000,
};

/**
 * Per-IP API limiter for unauthenticated requests.
 * Max 30 requests per minute per IP across all API routes.
 */
export const ipApiLimiter: RateLimitConfig = {
  id: "ip-api",
  limit: 30,
  windowMs: 60 * 1000,
  blockDurationMs: 2 * 60 * 1000, // 2 min block
};

/**
 * Strict per-IP limiter for auth endpoints.
 * Max 10 attempts per 15 minutes per IP.
 */
export const authLimiter: RateLimitConfig = {
  id: "auth",
  limit: 10,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
};

/**
 * Extract the real client IP from a Next.js request.
 * Handles Vercel, Cloudflare, and direct connections.
 */
export function getClientIp(request: Request): string {
  const headers = request instanceof Request ? request.headers : new Headers();

  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Build a standard 429 response with Retry-After header.
 */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": "exceeded",
      },
    }
  );
}

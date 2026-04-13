import { NextRequest, NextResponse } from "next/server";
import { rateLimit, ipApiLimiter, authLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Next.js Middleware — runs on the Edge before every matched request.
 *
 * Applies:
 * 1. Strict rate limiting on auth endpoints (10 req / 15 min per IP)
 * 2. General IP rate limiting on all /api/* routes (30 req / min per IP)
 *
 * Per-user generation limiting is handled inside the route handler itself
 * (after auth) because middleware runs before we know the user identity.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // ── Auth endpoints — strict limiting ──────────────────────────────────
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth/")) {
    const result = rateLimit(ip, authLimiter);
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: `Too many authentication attempts. Please try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfter),
          },
        }
      );
    }
  }

  // ── All API routes — general IP limiting ──────────────────────────────
  if (pathname.startsWith("/api/")) {
    const result = rateLimit(ip, ipApiLimiter);
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfter),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Pass remaining count as a response header for debugging
    if (result.success) {
      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Remaining", String(result.remaining));
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Match auth pages (for brute-force protection)
    "/auth/:path*",
  ],
};

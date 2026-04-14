import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, ipApiLimiter, authLimiter, getClientIp } from "@/lib/rate-limit";

/**
 * Next.js Proxy (formerly middleware) — runs on the Edge before every matched request.
 *
 * Applies:
 * 1. Auth redirect — unauthenticated users are sent to /auth/sign-in
 * 2. Strict rate limiting on auth endpoints (10 req / 15 min per IP)
 * 3. General IP rate limiting on all /api/* routes (30 req / min per IP)
 *
 * Per-user generation limiting is handled inside the route handler itself
 * (after auth) because this proxy runs before we know the user identity.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Auth redirect ─────────────────────────────────────────────────────────
  const accessToken = request.cookies.get("insforge_access_token")?.value;
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/api");

  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // ── Stripe webhook — skip rate limiting entirely ──────────────────────────
  if (pathname === "/api/stripe/webhook") {
    return NextResponse.next();
  }

  // ── Auth endpoints — strict rate limiting ─────────────────────────────────
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth/")) {
    const ip = getClientIp(request);
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

  // ── All API routes — general IP rate limiting ─────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
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

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pages (for auth redirect) — exclude static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

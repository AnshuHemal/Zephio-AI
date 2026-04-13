import { NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";
import { getOrCreateCredits, remainingGenerations, PLANS } from "@/lib/credits";

/**
 * GET /api/credits
 * Returns the current user's usage stats.
 */
export async function GET() {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const credits = await getOrCreateCredits(insforge, user.id);
    const limit = PLANS[credits.plan]?.generationsPerMonth ?? 10;
    const remaining = remainingGenerations(credits);

    return NextResponse.json({
      used: credits.used,
      limit: limit === Infinity ? null : limit,
      remaining: remaining === Infinity ? null : remaining,
      plan: credits.plan,
      resetAt: credits.resetAt,
    });
  } catch (err) {
    console.error("[credits]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

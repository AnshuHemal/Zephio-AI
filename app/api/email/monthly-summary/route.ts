import { NextRequest, NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { sendUsageSummaryEmail } from "@/lib/email";
import { PLANS } from "@/lib/credits";

/**
 * POST /api/email/monthly-summary
 *
 * Sends a monthly usage summary to all free-tier users who have used
 * at least 1 generation this month.
 *
 * Trigger this via a cron job on the 28th of each month.
 * Protect with CRON_SECRET to prevent unauthorized calls.
 *
 * Example cron (Vercel): 0 9 28 * * → POST /api/email/monthly-summary
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const insforge = await createInsForgeServerClient();

    // Fetch all free-tier users who have used at least 1 generation
    const { data: credits, error } = await insforge.database
      .from("user_credits")
      .select("userId, used, resetAt, plan")
      .eq("plan", "free")
      .gt("used", 0);

    if (error) {
      console.error("[monthly-summary] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (!credits || credits.length === 0) {
      return NextResponse.json({ sent: 0, message: "No eligible users" });
    }

    const userIds = credits.map((c: any) => c.userId);

    // Fetch profiles for email + name
    const { data: profiles } = await insforge.database
      .from("profiles")
      .select("userId, fullName, email")
      .in("userId", userIds);

    const profileMap: Record<string, { fullName: string; email: string }> = {};
    for (const p of profiles ?? []) {
      profileMap[p.userId] = p;
    }

    let sent = 0;
    const limit = PLANS.free.generationsPerMonth;

    for (const credit of credits) {
      const profile = profileMap[credit.userId];
      if (!profile?.email) continue;

      const resetDate = new Date(credit.resetAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });

      await sendUsageSummaryEmail({
        to: profile.email,
        firstName: profile.fullName?.split(" ")[0] || "there",
        used: credit.used,
        limit,
        resetDate,
      });

      sent++;

      // Rate limit: 2 emails/second to stay within Resend's limits
      await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`[monthly-summary] Sent ${sent} emails`);
    return NextResponse.json({ sent, total: credits.length });
  } catch (err) {
    console.error("[monthly-summary]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

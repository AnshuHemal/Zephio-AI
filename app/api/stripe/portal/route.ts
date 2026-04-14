import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";
import { stripe } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/stripe/portal
 *
 * Opens the Stripe Customer Portal so the user can manage their
 * subscription, update payment method, or cancel.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: credits } = await insforge.database
      .from("user_credits")
      .select("stripeCustomerId")
      .eq("userId", user.id)
      .single();

    const customerId = credits?.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found. Please upgrade first." },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[stripe/portal]", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

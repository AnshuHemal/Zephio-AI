import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";
import { stripe, PLAN_TO_STRIPE_PRICE } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/stripe/checkout
 * Body: { plan: "pro" | "team" }
 *
 * Creates a Stripe Checkout session and returns the URL to redirect to.
 * Attaches the Stripe customer ID to user_credits so the webhook can
 * look up the user later.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan = "pro" } = await req.json();
    const priceId = PLAN_TO_STRIPE_PRICE[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for plan: ${plan}` },
        { status: 400 }
      );
    }

    // Fetch or create the user_credits row to get existing stripeCustomerId
    const { data: credits } = await insforge.database
      .from("user_credits")
      .select("stripeCustomerId, plan")
      .eq("userId", user.id)
      .single();

    let customerId: string | undefined = credits?.stripeCustomerId ?? undefined;

    // Create a new Stripe customer if we don't have one yet
    if (!customerId) {
      const userEmail = typeof (user as { email?: string }).email === "string"
        ? (user as { email: string }).email
        : undefined;
      const userProfile = (user as { profile?: { fullName?: string; name?: string } }).profile;
      const userName = userProfile?.fullName ?? userProfile?.name ?? undefined;

      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // Persist the customer ID immediately so the webhook can find the user
      await insforge.database
        .from("user_credits")
        .upsert(
          {
            userId: user.id,
            stripeCustomerId: customerId,
            plan: credits?.plan ?? "free",
            used: 0,
            updatedAt: new Date().toISOString(),
          },
          { onConflict: "userId" }
        );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: user.id as string, plan },
      },
      success_url: `${APP_URL}/dashboard?upgraded=1`,
      cancel_url: `${APP_URL}/dashboard?upgrade_cancelled=1`,
      metadata: { userId: user.id as string, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

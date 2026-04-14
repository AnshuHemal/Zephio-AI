import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_TO_PLAN } from "@/lib/stripe";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe events and keeps user_credits.plan in sync.
 *
 * Handled events:
 *   checkout.session.completed      → activate subscription
 *   customer.subscription.updated   → plan change / renewal
 *   customer.subscription.deleted   → downgrade to free
 *   invoice.payment_failed          → (logged, no action needed)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe-signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe/webhook] Signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  const insforge = await createInsForgeServerClient();

  try {
    switch (event.type) {
      // ── Checkout completed → subscription is now active ──────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan ?? "pro";
        const customerId = session.customer as string;

        if (!userId) {
          console.error("[stripe/webhook] checkout.session.completed: missing userId in metadata");
          break;
        }

        await activateUserPlan(insforge, userId, plan, customerId);
        console.log(`[stripe/webhook] Activated plan=${plan} for userId=${userId}`);
        break;
      }

      // ── Subscription updated (plan change, renewal, trial end) ────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const userId = await getUserIdByCustomer(insforge, customerId);
        if (!userId) break;

        // Derive plan from the first price item
        const priceId = sub.items.data[0]?.price?.id ?? "";
        const plan = STRIPE_PRICE_TO_PLAN[priceId] ?? "pro";
        const isActive = ["active", "trialing"].includes(sub.status);

        if (isActive) {
          await updateUserPlan(insforge, userId, plan, customerId);
          console.log(`[stripe/webhook] Updated plan=${plan} for userId=${userId}`);
        } else {
          console.warn(`[stripe/webhook] Subscription status=${sub.status} for userId=${userId}`);
        }
        break;
      }

      // ── Subscription cancelled → downgrade to free ────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const userId = await getUserIdByCustomer(insforge, customerId);
        if (!userId) break;

        await updateUserPlan(insforge, userId, "free", customerId);
        console.log(`[stripe/webhook] Downgraded to free for userId=${userId}`);
        break;
      }

      // ── Payment failed — log only ─────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `[stripe/webhook] Payment failed for customer=${invoice.customer}, amount=${invoice.amount_due}`
        );
        break;
      }

      default:
        // Unhandled event — ignore silently
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] Handler error:", err);
    // Return 200 so Stripe doesn't retry — we log the error internally
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Activate a new subscription — sets plan and resets usage counter.
 * Only called on checkout.session.completed (first activation).
 */
async function activateUserPlan(
  insforge: any,
  userId: string,
  plan: string,
  stripeCustomerId: string
) {
  const now = new Date().toISOString();
  await insforge.database
    .from("user_credits")
    .upsert(
      {
        userId,
        plan,
        stripeCustomerId,
        used: 0,           // reset usage on fresh activation
        updatedAt: now,
      },
      { onConflict: "userId" }
    );
}

/**
 * Update plan only — preserves the existing usage counter.
 * Used for subscription renewals and plan changes.
 */
async function updateUserPlan(
  insforge: any,
  userId: string,
  plan: string,
  stripeCustomerId: string
) {
  const now = new Date().toISOString();
  await insforge.database
    .from("user_credits")
    .upsert(
      {
        userId,
        plan,
        stripeCustomerId,
        updatedAt: now,
        // NOTE: `used` is intentionally omitted — we don't reset on renewal
      },
      { onConflict: "userId", ignoreDuplicates: false }
    );
}

async function getUserIdByCustomer(
  insforge: any,
  customerId: string
): Promise<string | null> {
  const { data } = await insforge.database
    .from("user_credits")
    .select("userId")
    .eq("stripeCustomerId", customerId)
    .single();
  return data?.userId ?? null;
}

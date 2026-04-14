import Stripe from "stripe";

// Lazy singleton — avoids crashing at build time when env var isn't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep named export for convenience — callers that import `stripe` directly
// will get the singleton (throws at runtime if key missing, not at build time)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/** Map Stripe price IDs → internal plan names */
export const STRIPE_PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY ?? ""]: "pro",
  [process.env.STRIPE_PRICE_TEAM_MONTHLY ?? ""]: "team",
};

/** Map internal plan names → Stripe price IDs */
export const PLAN_TO_STRIPE_PRICE: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  team: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "",
};

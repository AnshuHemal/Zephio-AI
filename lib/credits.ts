/**
 * Credits / usage limits system.
 *
 * Schema (Insforge DB):
 *   user_credits table:
 *     userId        TEXT PRIMARY KEY
 *     used          INT  DEFAULT 0
 *     resetAt       TIMESTAMPTZ  -- first day of next month
 *     plan          TEXT DEFAULT 'free'  -- 'free' | 'pro' | 'team'
 *     updatedAt     TIMESTAMPTZ
 */

export const PLANS = {
  free: {
    label: "Free",
    generationsPerMonth: 10,
    color: "text-muted-foreground",
  },
  pro: {
    label: "Pro",
    generationsPerMonth: Infinity,
    color: "text-primary",
  },
  team: {
    label: "Team",
    generationsPerMonth: Infinity,
    color: "text-primary",
  },
} as const;

export type Plan = keyof typeof PLANS;

export type UserCredits = {
  userId: string;
  used: number;
  resetAt: string;
  plan: Plan;
  updatedAt: string;
};

/** Returns the first day of next month as an ISO string */
export function nextMonthReset(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

/** True if the resetAt date has passed — credits should be reset */
export function shouldReset(resetAt: string): boolean {
  return new Date() >= new Date(resetAt);
}

/** How many generations remain for this user */
export function remainingGenerations(credits: UserCredits): number {
  const limit = PLANS[credits.plan]?.generationsPerMonth ?? 10;
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - credits.used);
}

/** True if the user has hit their limit */
export function isLimitReached(credits: UserCredits): boolean {
  return remainingGenerations(credits) <= 0;
}

/**
 * Fetch or create the credits row for a user.
 * Resets the counter if the month has rolled over.
 */
export async function getOrCreateCredits(
  insforge: any,
  userId: string
): Promise<UserCredits> {
  const { data: existing } = await insforge.database
    .from("user_credits")
    .select("*")
    .eq("userId", userId)
    .single();

  // Row exists and month hasn't rolled over
  if (existing && !shouldReset(existing.resetAt)) {
    return existing as UserCredits;
  }

  // Either no row, or month rolled over — upsert with fresh counter
  const resetAt = nextMonthReset();
  const now = new Date().toISOString();

  const { data: upserted } = await insforge.database
    .from("user_credits")
    .upsert(
      {
        userId,
        used: 0,
        resetAt,
        plan: existing?.plan ?? "free",
        updatedAt: now,
      },
      { onConflict: "userId" }
    )
    .select()
    .single();

  return (upserted ?? { userId, used: 0, resetAt, plan: "free", updatedAt: now }) as UserCredits;
}

/**
 * Increment the used counter by 1.
 * Returns the updated credits row.
 */
export async function incrementCredits(
  insforge: any,
  userId: string,
  currentCredits: UserCredits
): Promise<UserCredits> {
  const newUsed = currentCredits.used + 1;
  const now = new Date().toISOString();

  const { data } = await insforge.database
    .from("user_credits")
    .update({ used: newUsed, updatedAt: now })
    .eq("userId", userId)
    .select()
    .single();

  return (data ?? { ...currentCredits, used: newUsed }) as UserCredits;
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type CreditsData = {
  used: number;
  limit: number | null;
  remaining: number | null;
  plan: string;
  resetAt: string;
};

type Props = {
  /** Called when the user clicks the badge (e.g. open upgrade modal) */
  onUpgradeClick?: () => void;
  /** Refresh trigger — increment to force a refetch */
  refreshKey?: number;
};

export default function CreditsBadge({ onUpgradeClick, refreshKey = 0 }: Props) {
  const [data, setData] = useState<CreditsData | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => null);
  }, [refreshKey]);

  if (!data) return null;

  // Unlimited plan — show nothing
  if (data.limit === null) return null;

  const pct = Math.min((data.used / data.limit) * 100, 100);
  const isLow = (data.remaining ?? 0) <= 3;
  const isOut = (data.remaining ?? 0) === 0;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={onUpgradeClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200",
        isOut
          ? "border-destructive/30 bg-destructive/8 text-destructive hover:bg-destructive/12"
          : isLow
          ? "border-amber-500/30 bg-amber-500/8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/12"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      title={`${data.remaining} generation${data.remaining !== 1 ? "s" : ""} remaining this month`}
    >
      <Zap className={cn("size-3", isOut || isLow ? "fill-current" : "")} />
      <span>
        {isOut ? "Limit reached" : `${data.remaining} left`}
      </span>

      {/* Mini progress arc */}
      <div className="relative size-3.5">
        <svg className="size-3.5 -rotate-90" viewBox="0 0 14 14">
          <circle
            cx="7" cy="7" r="5"
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth="2"
          />
          <circle
            cx="7" cy="7" r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 31.4} 31.4`}
          />
        </svg>
      </div>
    </motion.button>
  );
}

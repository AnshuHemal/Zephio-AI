"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/lib/analytics";

type Props = {
  plan?: "pro" | "team";
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  children?: React.ReactNode;
  onSuccess?: () => void;
};

export default function UpgradeButton({
  plan = "pro",
  className,
  size = "default",
  variant = "default",
  children,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { capture } = useAnalytics();

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    capture("upgrade_clicked", { source: "upgrade_button", plan_selected: plan });

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Failed to start checkout. Please try again.");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={cn("gap-2 font-semibold", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="spinner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        ) : (
          <motion.span
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Zap className="size-4 fill-current opacity-80" />
          </motion.span>
        )}
      </AnimatePresence>
      {children ?? (loading ? "Redirecting…" : "Upgrade to Pro")}
    </Button>
  );
}

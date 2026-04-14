"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost";
  children?: React.ReactNode;
};

export default function ManageBillingButton({
  className,
  size = "sm",
  variant = "outline",
  children,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Could not open billing portal.");
        return;
      }

      window.location.href = data.url;
    } catch {
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
      className={cn("gap-1.5", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        ) : (
          <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CreditCard className="size-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
      {children ?? (loading ? "Opening…" : "Manage billing")}
    </Button>
  );
}

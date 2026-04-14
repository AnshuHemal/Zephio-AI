"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Zap, X, Check, Sparkles } from "lucide-react";
import { useAnalytics } from "@/lib/analytics";
import { useEffect } from "react";
import { useKeyboardShortcutsContext } from "@/components/keyboard-shortcuts-provider";
import UpgradeButton from "./upgrade-button";

type Props = {
  open: boolean;
  used: number;
  limit: number;
  resetAt?: string;
  onClose: () => void;
  trigger?: "limit_reached" | "credits_badge" | "manual";
  plan?: string;
};

const PRO_FEATURES = [
  "Unlimited AI generations",
  "Unlimited projects",
  "Export as ZIP (all pages)",
  "No watermark on exports",
  "Priority AI models",
  "Email support",
];

export default function UpgradeModal({ open, used, limit, resetAt, onClose, trigger = "manual", plan = "free" }: Props) {
  const resetDate = resetAt
    ? new Date(resetAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;

  const { capture } = useAnalytics();
  const { registerEscapeHandler } = useKeyboardShortcutsContext();

  // Track when the modal becomes visible
  useEffect(() => {
    if (open) {
      capture("upgrade_modal_opened", { trigger, used, limit, plan });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register Escape to close modal
  useEffect(() => {
    if (open) {
      return registerEscapeHandler(onClose);
    }
  }, [open, registerEscapeHandler, onClose]);

  const handleUpgradeClick = () => {
    capture("upgrade_clicked", { source: "modal", plan_selected: "pro" });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">
              {/* Header gradient bar */}
              <div className="h-1 bg-linear-to-r from-primary/60 via-primary to-primary/60" />

              <div className="p-7">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>

                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Zap className="size-5 text-primary fill-primary/20" />
                </div>

                {/* Heading */}
                <h2 className="text-xl font-bold text-foreground mb-1">
                  You've used all {limit} free generations
                </h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {resetDate
                    ? `Your free tier resets on ${resetDate}. Upgrade to Pro for unlimited generations right now.`
                    : "Upgrade to Pro for unlimited generations and no monthly limits."}
                </p>

                {/* Usage bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Monthly usage</span>
                    <span className="font-medium text-foreground">{used} / {limit}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Pro features */}
                <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="size-3.5 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Pro — $12/month
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {PRO_FEATURES.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <Check className="size-3.5 text-green-500 shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-2">
                  <UpgradeButton
                    plan="pro"
                    className="w-full"
                    onSuccess={onClose}
                  >
                    Upgrade to Pro
                  </UpgradeButton>
                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
                    {resetDate ? `Wait until ${resetDate}` : "Maybe later"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

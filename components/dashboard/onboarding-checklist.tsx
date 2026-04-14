"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { X, ChevronDown, ChevronUp, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHECKLIST_STEPS,
  type OnboardingState,
  type ChecklistStepId,
  completedCount,
  isChecklistComplete,
  dismissChecklist,
} from "@/lib/onboarding-checklist";

type Props = {
  state: OnboardingState;
  onStepComplete?: (stepId: ChecklistStepId) => void;
  onDismiss: () => void;
};

export default function OnboardingChecklist({ state, onDismiss }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const done = completedCount(state);
  const total = CHECKLIST_STEPS.length;
  const allDone = isChecklistComplete(state);
  const pct = Math.round((done / total) * 100);

  // Auto-collapse when all steps are done, then auto-dismiss after a delay
  useEffect(() => {
    if (allDone) {
      const t1 = setTimeout(() => setCollapsed(true), 800);
      const t2 = setTimeout(() => {
        dismissChecklist();
        onDismiss();
      }, 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [allDone, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 sm:mb-8"
    >
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="size-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {allDone ? "You're all set! 🎉" : "Get started with Zephio"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allDone
                ? "You've completed all the key steps."
                : `${done} of ${total} steps completed`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Step count pill */}
            <span className="text-[11px] font-semibold tabular-nums text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {done}/{total}
            </span>

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
            </button>

            {/* Dismiss */}
            <button
              onClick={() => { dismissChecklist(); onDismiss(); }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Steps list */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="steps"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-col gap-2">
                {CHECKLIST_STEPS.map((step, i) => {
                  const isCompleted = state.completed[step.id];
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200",
                        isCompleted
                          ? "border-green-500/20 bg-green-500/5"
                          : "border-border bg-background hover:border-primary/20 hover:bg-primary/3"
                      )}
                    >
                      {/* Check circle */}
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isCompleted
                            ? "border-green-500 bg-green-500"
                            : "border-border bg-background"
                        )}
                      >
                        <AnimatePresence initial={false}>
                          {isCompleted && (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <Check className="size-3 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Emoji */}
                      <span className="text-base leading-none shrink-0">{step.emoji}</span>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium leading-tight",
                          isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {step.label}
                        </p>
                        {!isCompleted && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                            {step.description}
                          </p>
                        )}
                      </div>

                      {/* Action link for incomplete steps */}
                      {!isCompleted && (
                        <StepAction stepId={step.id} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Per-step action links ─────────────────────────────────────────────────────
function StepAction({ stepId }: { stepId: ChecklistStepId }) {
  switch (stepId) {
    case "create_project":
      return (
        <Link
          href="/new"
          className="shrink-0 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Start →
        </Link>
      );
    case "generate_page":
      return (
        <Link
          href="/new"
          className="shrink-0 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Open →
        </Link>
      );
    case "export_design":
    case "share_preview":
      return (
        <span className="shrink-0 text-xs text-muted-foreground">
          In editor
        </span>
      );
    default:
      return null;
  }
}

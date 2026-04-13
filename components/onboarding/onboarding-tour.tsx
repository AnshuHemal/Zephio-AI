"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { markTourCompleted } from "@/lib/onboarding";
import { MessageSquare, Wand2, Download, X, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Describe your vision",
    description:
      "Type what you want in plain English — a landing page, dashboard, portfolio. Be as detailed or brief as you like.",
    highlight: "prompt",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Wand2,
    title: "AI generates your pages",
    description:
      "Zephio analyzes your request and generates production-ready HTML with Tailwind CSS — streamed live to your canvas.",
    highlight: "canvas",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Download,
    title: "Export, share, or iterate",
    description:
      "Download as a ZIP, share a live preview link, or keep refining with follow-up prompts. Your design, your control.",
    highlight: "export",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

type Props = {
  onComplete: () => void;
};

export default function OnboardingTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so the page renders first
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setVisible(false);
    markTourCompleted();
    setTimeout(onComplete, 300);
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleComplete}
          />

          {/* Tour card */}
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <div className="p-7">
                {/* Close */}
                <button
                  onClick={handleComplete}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step
                          ? "w-6 bg-primary"
                          : i < step
                          ? "w-3 bg-primary/40"
                          : "w-3 bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Icon */}
                    <div className={`mb-4 w-12 h-12 rounded-xl ${current.bg} flex items-center justify-center`}>
                      <Icon className={`size-5 ${current.color}`} />
                    </div>

                    {/* Content */}
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Step {step + 1} of {STEPS.length}
                    </p>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {current.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {current.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="mt-7 flex items-center justify-between">
                  <button
                    onClick={handleComplete}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip tour
                  </button>
                  <Button onClick={handleNext} className="gap-2">
                    {step < STEPS.length - 1 ? (
                      <>
                        Next
                        <ArrowRight className="size-3.5" />
                      </>
                    ) : (
                      "Start building"
                    )}
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

"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { MessageSquare, Wand2, Download } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Describe your vision",
    description:
      "Type what you want in plain English. Be as detailed or as brief as you like — Zephio understands design intent, not just keywords.",
    color: "text-blue-500",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI generates your pages",
    description:
      "Zephio analyzes your request, creates a design blueprint, then generates production-ready HTML with Tailwind CSS — streamed live to your canvas.",
    color: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/20",
  },
  {
    number: "03",
    icon: Download,
    title: "Export, share, or iterate",
    description:
      "Download as a ZIP, share a live preview link, or keep refining with follow-up prompts. Your design, your control.",
    color: "text-green-500",
    bg: "bg-green-500/8",
    border: "border-green-500/20",
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="relative py-28 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
            From idea to website
            <br />
            in three steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            No design skills. No code. Just describe what you want and watch it come to life.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col gap-5 rounded-2xl border border-border bg-card p-8 shadow-sm"
              >
                {/* Step number */}
                <span className="absolute top-6 right-6 text-5xl font-black text-muted/30 select-none leading-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center`}>
                  <Icon className={`size-5 ${step.color}`} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Connector line (not on last) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-px bg-border" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-border" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

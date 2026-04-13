"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Zap, Share2, Download, Undo2, Layers, Palette,
  MousePointer, Code2, Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time streaming",
    description: "Watch your pages generate live, section by section. No waiting for a full render.",
    size: "col-span-1",
  },
  {
    icon: Layers,
    title: "Multi-page projects",
    description: "Generate up to 3 pages per prompt — landing page, pricing, dashboard — all in one go.",
    size: "col-span-1",
  },
  {
    icon: MousePointer,
    title: "Interactive canvas",
    description: "Zoom, pan, drag, and resize pages on an infinite canvas. Feels like a real design tool.",
    size: "col-span-1",
  },
  {
    icon: Sparkles,
    title: "AI-powered regeneration",
    description: "Select any page and ask Zephio to change just one section. Surgical edits, not full rewrites.",
    size: "col-span-2",
  },
  {
    icon: Palette,
    title: "Full design system",
    description: "Every page gets a complete CSS variable design system — colors, typography, shadows, radius — all consistent.",
    size: "col-span-1",
  },
  {
    icon: Undo2,
    title: "Undo / Redo history",
    description: "Made a mistake? Cmd+Z brings back the last 20 states. Experiment freely.",
    size: "col-span-1",
  },
  {
    icon: Share2,
    title: "Instant share links",
    description: "One click generates a public preview URL. Share with clients before they even sign up.",
    size: "col-span-1",
  },
  {
    icon: Download,
    title: "Export as ZIP",
    description: "Download all pages as self-contained HTML files with fonts, icons, and styles included.",
    size: "col-span-1",
  },
  {
    icon: Code2,
    title: "Production-ready HTML",
    description: "Tailwind CSS, Google Fonts, Iconify icons — clean, semantic markup ready to ship.",
    size: "col-span-1",
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="relative py-28 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
            Everything you need
            <br />
            to build the web
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Zephio isn't just a generator — it's a full design workspace powered by AI.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 ${
                  feature.size === "col-span-2" ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative">
                  <div className="mb-4 w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                    <Icon className="size-4.5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

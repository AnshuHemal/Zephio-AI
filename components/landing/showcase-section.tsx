"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ExternalLink } from "lucide-react";

const EXAMPLES = [
  {
    title: "SaaS Landing Page",
    prompt: "A modern SaaS landing page for an AI productivity tool with dark theme, bento grid features, and glowing CTA",
    tags: ["Dark theme", "Bento grid", "SaaS"],
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    accent: "bg-violet-500",
    mockBg: "bg-gradient-to-br from-slate-900 to-slate-800",
    mockAccent: "#8b5cf6",
  },
  {
    title: "Portfolio Website",
    prompt: "A minimal portfolio for a UI/UX designer with case studies, clean typography, and subtle animations",
    tags: ["Minimal", "Portfolio", "Light"],
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
    accent: "bg-orange-500",
    mockBg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    mockAccent: "#f97316",
  },
  {
    title: "E-commerce Store",
    prompt: "A luxury fashion e-commerce homepage with editorial hero, product grid, and premium feel",
    tags: ["E-commerce", "Luxury", "Editorial"],
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    accent: "bg-rose-500",
    mockBg: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
    mockAccent: "#f43f5e",
  },
  {
    title: "FinTech Dashboard",
    prompt: "A fintech analytics dashboard with charts, KPI cards, dark sidebar, and real-time data feel",
    tags: ["Dashboard", "FinTech", "Dark"],
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    accent: "bg-emerald-500",
    mockBg: "bg-gradient-to-br from-slate-900 to-emerald-950/50",
    mockAccent: "#10b981",
  },
];

function MockPage({ example }: { example: typeof EXAMPLES[0] }) {
  return (
    <div className={`w-full h-full ${example.mockBg} rounded-lg overflow-hidden p-4 flex flex-col gap-3`}>
      {/* Fake nav */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="h-2 w-12 rounded-full bg-white/20" />
          <div className="h-2 w-8 rounded-full bg-white/10" />
        </div>
        <div className="flex gap-1">
          <div className="h-2 w-6 rounded-full bg-white/10" />
          <div className="h-2 w-6 rounded-full bg-white/10" />
          <div className="h-2 w-10 rounded-full" style={{ backgroundColor: example.mockAccent + "60" }} />
        </div>
      </div>
      {/* Fake hero */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
        <div className="h-3 w-3/4 rounded-full bg-white/25" />
        <div className="h-2 w-1/2 rounded-full bg-white/15" />
        <div className="h-2 w-2/3 rounded-full bg-white/10" />
        <div className="mt-2 flex gap-2">
          <div className="h-5 w-16 rounded" style={{ backgroundColor: example.mockAccent + "80" }} />
          <div className="h-5 w-14 rounded bg-white/10" />
        </div>
      </div>
      {/* Fake cards */}
      <div className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 rounded bg-white/8 border border-white/10 p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-full rounded-full bg-white/20" />
            <div className="h-1 w-2/3 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShowcaseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="showcase" ref={ref} className="relative py-28 px-6 bg-muted/20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Showcase
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
            What Zephio can build
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Every design below was generated from a single text prompt. No templates, no drag-and-drop.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {EXAMPLES.map((example, i) => (
            <motion.div
              key={example.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              {/* Mock preview */}
              <div className="relative h-52 p-4 border-b border-border">
                <MockPage example={example} />

                {/* Hover overlay */}
                <motion.div
                  initial={false}
                  animate={{ opacity: hovered === i ? 1 : 0 }}
                  className="absolute inset-4 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <ExternalLink className="size-4" />
                    View example
                  </div>
                </motion.div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-foreground">{example.title}</h3>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {example.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  "{example.prompt}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { Sparkles, ArrowLeft } from "lucide-react";

const EXAMPLE_PROMPTS = [
  { emoji: "🚀", label: "SaaS landing page" },
  { emoji: "🎨", label: "Designer portfolio" },
  { emoji: "📊", label: "Analytics dashboard" },
  { emoji: "🛍️", label: "E-commerce store" },
];

export default function EmptyCanvas() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 px-6 text-center max-w-sm"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/8 shadow-lg shadow-primary/10"
        >
          <Sparkles className="size-7 text-primary" />
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-primary/30"
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Describe your vision
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Type a prompt in the chat and your design will appear here instantly.
          </p>
        </motion.div>

        {/* Arrow pointing left toward the chat panel */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur px-4 py-2 shadow-sm"
        >
          {/* Animated arrow */}
          <motion.div
            animate={{ x: [-3, 0, -3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowLeft className="size-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-foreground">
            Start in the chat
          </span>
        </motion.div>

        {/* Example prompt chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap justify-center gap-2"
        >
          {EXAMPLE_PROMPTS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.42 + i * 0.07,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground"
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

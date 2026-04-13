"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

const PROMPTS = [
  "A SaaS landing page for a project management tool with dark theme...",
  "A modern portfolio for a UI/UX designer with bento grid layout...",
  "An e-commerce homepage for a luxury fashion brand...",
  "A fintech dashboard with charts and analytics cards...",
];

export default function HeroSection() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = PROMPTS[promptIndex];
    if (typing) {
      if (displayed.length < current.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, 28);
      } else {
        timeoutRef.current = setTimeout(() => setTyping(false), 2200);
      }
    } else {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 12);
      } else {
        setPromptIndex((i) => (i + 1) % PROMPTS.length);
        setTyping(true);
      }
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayed, typing, promptIndex]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-primary/4 blur-[100px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
        >
          <Zap className="size-3.5 fill-primary" />
          AI-powered web design — no code required
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.05] text-foreground"
        >
          AI that designs.
          <br />
          <span className="text-primary">You that decides.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
        >
          Describe your vision in plain English. Zephio generates production-ready,
          stunning web pages in seconds — live on an interactive canvas.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3"
        >
          <Button size="lg" className="group h-12 px-8 text-base font-semibold gap-2" asChild>
            <Link href="/auth/sign-up">
              Start building free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
            <a href="#showcase">See examples</a>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mt-3 text-sm text-muted-foreground"
        >
          Free to start · No credit card required
        </motion.p>

        {/* Animated prompt demo */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 w-full max-w-3xl"
        >
          {/* Fake browser chrome */}
          <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/70" />
                <div className="size-3 rounded-full bg-yellow-400/70" />
                <div className="size-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 mx-4 rounded-md bg-background/60 border border-border px-3 py-1 text-xs text-muted-foreground text-center">
                zephio.app
              </div>
            </div>

            {/* Prompt input area */}
            <div className="p-6">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-sm">
                <Sparkles className="size-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-h-[48px]">
                  <p className="text-sm text-foreground leading-relaxed">
                    {displayed}
                    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                  </p>
                </div>
              </div>

              {/* Fake generation progress */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="size-2 rounded-full bg-primary/40"
                      style={{ animation: `bounce-dots 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Generating your design...</span>
              </div>

              {/* Fake page cards */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["Hero Section", "Features", "Pricing"].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.15, duration: 0.4 }}
                    className="rounded-lg border border-border bg-muted/30 p-3 text-center"
                  >
                    <div className="h-16 rounded-md bg-primary/8 mb-2 flex items-center justify-center">
                      <div className="w-8 h-1 rounded bg-primary/30" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Glow under the card */}
          <div className="mx-auto mt-0 h-8 w-3/4 rounded-full bg-primary/10 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

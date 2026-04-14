"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type Props = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
  badge: string;
};

export default function LegalPage({
  title,
  subtitle,
  effectiveDate,
  lastUpdated,
  sections,
  badge,
}: Props) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Intersection observer to highlight active TOC item
  useEffect(() => {
    if (!mounted) return;
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [mounted, sections]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <main className="relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] right-[5%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute top-[40%] left-[0%] h-[400px] w-[400px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative border-b border-border/60 py-16 px-6"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            {badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-lg text-muted-foreground max-w-2xl"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span>
              <span className="font-medium text-foreground">Effective:</span>{" "}
              {effectiveDate}
            </span>
            <span className="text-border hidden sm:block">·</span>
            <span>
              <span className="font-medium text-foreground">Last updated:</span>{" "}
              {lastUpdated}
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* Body: TOC + Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex gap-12">
          {/* Sticky TOC — desktop only */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block w-56 shrink-0"
          >
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Contents
              </p>
              <nav className="flex flex-col gap-0.5">
                {sections.map(({ id, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      activeSection === id
                        ? "bg-primary/8 text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${
                        activeSection === id ? "bg-primary scale-125" : "bg-border group-hover:bg-muted-foreground"
                      }`}
                    />
                    {title}
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Main content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0 flex-1"
          >
            {sections.map(({ id, title, content }, index) => (
              <motion.section
                key={id}
                id={id}
                variants={itemVariants}
                className={`scroll-mt-28 ${index !== sections.length - 1 ? "mb-12 pb-12 border-b border-border/60" : ""}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {title}
                  </h2>
                </div>
                <div className="prose-legal">{content}</div>
              </motion.section>
            ))}

            {/* Contact card */}
            <motion.div
              variants={itemVariants}
              className="mt-12 rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="font-semibold text-foreground mb-1">Questions?</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about this document, please contact us at{" "}
                <a
                  href="mailto:legal@zephio.app"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  legal@zephio.app
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

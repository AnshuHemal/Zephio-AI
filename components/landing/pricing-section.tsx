"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import UpgradeButton from "@/components/credits/upgrade-button";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying Zephio and building your first project.",
    cta: "Get started free",
    ctaVariant: "outline" as const,
    href: "/auth/sign-up",
    stripePlan: null as null | "pro" | "team",
    featured: false,
    features: [
      "10 AI generations per month",
      "Up to 3 projects",
      "Export as HTML",
      "Share preview links",
      "Community support",
    ],
    missing: ["Unlimited generations", "Priority AI models", "Remove watermark"],
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For designers and developers who build seriously.",
    cta: "Start Pro — 7 days free",
    ctaVariant: "default" as const,
    href: null,
    stripePlan: "pro" as const,
    featured: true,
    badge: "Most popular",
    features: [
      "Unlimited AI generations",
      "Unlimited projects",
      "Export as ZIP (all pages)",
      "Share preview links",
      "No watermark on exports",
      "Priority AI models",
      "Email support",
    ],
    missing: [],
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    description: "For agencies and teams shipping client work.",
    cta: "Start Team trial",
    ctaVariant: "outline" as const,
    href: null,
    stripePlan: "team" as const,
    featured: false,
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared project workspace",
      "Client preview links",
      "Priority support",
      "Early access to features",
    ],
    missing: [],
  },
];

export default function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" ref={ref} className="relative py-28 px-6 bg-muted/20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col gap-6",
                plan.featured
                  ? "border-primary bg-card shadow-xl shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card shadow-sm"
              )}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Zap className="size-3 fill-primary-foreground" />
                  {plan.badge}
                </div>
              )}

              {/* Plan info */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tighter text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* CTA */}
              {plan.stripePlan ? (
                <UpgradeButton
                  plan={plan.stripePlan}
                  variant={plan.ctaVariant}
                  className="w-full"
                >
                  {plan.cta}
                </UpgradeButton>
              ) : (
                <Button variant={plan.ctaVariant} className="w-full" asChild>
                  <Link href={plan.href!}>{plan.cta}</Link>
                </Button>
              )}

              {/* Features */}
              <div className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{f}</span>
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                    <div className="size-4 shrink-0 mt-0.5 flex items-center justify-center">
                      <div className="w-3 h-px bg-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          All plans include a 7-day free trial on paid tiers. No credit card required to start free.
        </motion.p>
      </div>
    </section>
  );
}

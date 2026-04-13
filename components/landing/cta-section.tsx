"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-primary/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-primary/20 bg-card/80 backdrop-blur-sm p-12 shadow-xl shadow-primary/5"
        >
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-4">
            Ready to build
            <br />
            something stunning?
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of designers and developers who use Zephio to ship beautiful websites faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="group h-12 px-8 text-base font-semibold gap-2" asChild>
              <Link href="/auth/sign-up">
                Start building free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/auth/sign-in">Log in to your account</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Free forever · No credit card · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

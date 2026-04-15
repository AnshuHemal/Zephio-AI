"use client";

import { useState, useEffect } from "react";
import { ChatStatus } from "ai";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PromptInputMessage } from "../ai-elements/prompt-input";
import ChatInput from "./chat-input";
import OnboardingTour from "@/components/onboarding/onboarding-tour";
import TemplateGallery from "@/components/onboarding/template-gallery";
import UserTemplateGallery from "@/components/onboarding/user-template-gallery";
import { isTourCompleted, isFirstVisit } from "@/lib/onboarding";
import { Sparkles, LayoutGrid, HelpCircle, Clock, BookmarkPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/date-utils";

// ── Curated quick-start prompts ──────────────────────────────────────────────
const QUICK_PROMPTS = [
  {
    label: "AI SaaS Landing",
    icon: "🤖",
    value:
      "A cutting-edge landing page for an autonomous AI workflow platform. Deep space dark mode with vibrant indigo radial light-leaks, floating glassmorphic navbar, hero with glowing gradient text, bento grid showcasing features, and sleek pricing section.",
  },
  {
    label: "Designer Portfolio",
    icon: "🎨",
    value:
      "A minimal, editorial portfolio for a senior UI/UX designer. Clean white background, large typographic hero, 4-card case study grid with project thumbnails, skills section, and a contact section. Elegant typography, generous whitespace.",
  },
  {
    label: "Payments Platform",
    icon: "💳",
    value:
      "A high-conversion landing page for a payment link product. Strong hero with 'Accept Payments Instantly' headline, live payment preview mockup, trust badges, feature grid, use-case sections, pricing comparison, and a bold CTA. Clean fintech-grade design.",
  },
  {
    label: "Analytics Dashboard",
    icon: "📊",
    value:
      "A high-fidelity analytics dashboard. Dark sidebar navigation, top header with search. Main content with 4 KPI cards, a large SVG line chart for revenue, a bar chart for weekly signups, recent activity feed, and a top pages table. Dark charcoal background, emerald accents.",
  },
  {
    label: "Luxury Fashion Store",
    icon: "👗",
    value:
      "A luxury fashion e-commerce homepage. Editorial full-bleed hero, minimal black and white palette with gold accents. Featured collections grid, new arrivals product cards with hover zoom, a lookbook section, newsletter signup, and a minimal footer.",
  },
  {
    label: "Startup Launch Page",
    icon: "🚀",
    value:
      "A high-energy startup launch page. Centered layout with bold gradient headline, email waitlist signup with glowing CTA, social proof showing '2,847 people joined', 3 key benefit pills, product screenshot placeholder. Dark background with vibrant orange/amber accents.",
  },
];

type Tab = "prompts" | "templates" | "my-templates";

type PropsType = {
  input: string;
  isLoading: boolean;
  status: ChatStatus;
  setInput: (input: string) => void;
  onStop: () => void;
  onSubmit: (message: PromptInputMessage, options?: any) => void;
};

const NewProjectChat = ({
  input,
  isLoading,
  status,
  setInput,
  onStop,
  onSubmit,
}: PropsType) => {
  const [activeTab, setActiveTab] = useState<Tab>("prompts");
  const [showTour, setShowTour] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show tour only on first ever visit
    if (isFirstVisit() && !isTourCompleted()) {
      setShowTour(true);
    }
  }, []);

  const handlePromptSelect = (value: string) => {
    setInput(value);
    // Scroll to top so the input is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTemplateSelect = (prompt: string) => {
    setInput(prompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Onboarding tour overlay */}
      {showTour && (
        <OnboardingTour onComplete={() => setShowTour(false)} />
      )}

      <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 pt-16 pb-20">
          {/* Header */}
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-3.5 fill-primary" />
              AI that designs. You that decides.
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-foreground mb-3">
              What are we building?
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Describe your vision and watch it come to life in seconds.
            </p>
          </motion.div>

          {/* Chat input */}
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl mx-auto mb-10"
          >
            <ChatInput
              input={input}
              isLoading={isLoading}
              status={status}
              setInput={setInput}
              onStop={onStop}
              onSubmit={onSubmit}
            />
          </motion.div>

          {/* Tab switcher */}
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
                <TabButton
                  active={activeTab === "prompts"}
                  onClick={() => setActiveTab("prompts")}
                  icon={<Sparkles className="size-3.5" />}
                  label="Quick start"
                />
                <TabButton
                  active={activeTab === "templates"}
                  onClick={() => setActiveTab("templates")}
                  icon={<LayoutGrid className="size-3.5" />}
                  label="Templates"
                />
                <TabButton
                  active={activeTab === "my-templates"}
                  onClick={() => setActiveTab("my-templates")}
                  icon={<BookmarkPlus className="size-3.5" />}
                  label="My Templates"
                />
              </div>

              {/* Tour trigger */}
              <button
                onClick={() => setShowTour(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="size-3.5" />
                How it works
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "prompts" ? (
                <motion.div
                  key="prompts"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <QuickPrompts onSelect={handlePromptSelect} />
                </motion.div>
              ) : activeTab === "templates" ? (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TemplateGallery onSelect={handleTemplateSelect} />
                </motion.div>
              ) : (
                <motion.div
                  key="my-templates"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <UserTemplateGallery onSelect={handleTemplateSelect} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recent projects */}
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-12"
          >
            <RecentProjects />
          </motion.div>
        </div>
      </div>
    </>
  );
};

// ── Quick prompts grid ────────────────────────────────────────────────────────
function QuickPrompts({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {QUICK_PROMPTS.map((p, i) => (
        <motion.button
          key={p.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => onSelect(p.value)}
          className="group relative flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="absolute inset-0 rounded-xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          <span className="text-xl leading-none shrink-0">{p.icon}</span>
          <div className="relative min-w-0">
            <p className="text-sm font-semibold text-foreground mb-0.5">{p.label}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {p.value.slice(0, 80)}…
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabButton({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Recent projects ───────────────────────────────────────────────────────────
function RecentProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects-recent"],
    queryFn: async () => {
      const res = await fetch("/api/project");
      if (!res.ok) return [];
      return res.json() as Promise<{ id: string; title: string; slugId: string; createdAt: string }[]>;
    },
  });

  if (isLoading) return <RecentSkeleton />;
  if (!projects || projects.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock className="size-3.5 text-muted-foreground" />
          Recent projects
        </h5>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {projects.slice(0, 5).map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <Link
              href={`/project/${project.slugId}`}
              className="group flex flex-col gap-2 transition-all"
            >
              <div className="aspect-4/3 rounded-xl bg-muted overflow-hidden relative border border-border group-hover:border-primary/40 transition-colors">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/15" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary/30">
                    {project.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="px-0.5">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {project.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDistanceToNow(project.createdAt)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-muted rounded mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-4/3 rounded-xl bg-muted border border-border" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewProjectChat;

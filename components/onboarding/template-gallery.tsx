"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Props = {
  onSelect: (prompt: string) => void;
};

export default function TemplateGallery({ onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered =
    activeCategory === "All"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="w-full">
      {/* Category filter */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((template, i) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={i}
              isHovered={hovered === template.id}
              onHover={setHovered}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TemplateCard({
  template,
  index,
  isHovered,
  onHover,
  onSelect,
}: {
  template: Template;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (prompt: string) => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(template.prompt)}
      onMouseEnter={() => onHover(template.id)}
      onMouseLeave={() => onHover(null)}
      className="group relative flex flex-col items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Emoji icon */}
      <div className="relative text-2xl leading-none">{template.emoji}</div>

      {/* Info */}
      <div className="relative flex-1 w-full">
        <p className="text-xs font-semibold text-foreground leading-tight mb-1">
          {template.label}
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Category badge */}
      <div className="relative flex items-center justify-between w-full">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          {template.category}
        </span>
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-0.5 text-[10px] font-medium text-primary"
        >
          Use <ArrowRight className="size-2.5" />
        </motion.div>
      </div>
    </motion.button>
  );
}

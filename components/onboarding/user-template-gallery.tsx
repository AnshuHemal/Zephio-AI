"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookmarkPlus, Trash2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractPalette, buildThumbnailGradient } from "@/lib/thumbnail";
import { toast } from "sonner";

type UserTemplate = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  rootStyles: string;
  createdAt: string;
};

type Props = {
  onSelect: (prompt: string) => void;
};

export default function UserTemplateGallery({ onSelect }: Props) {
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.ok ? r.json() : { templates: [] })
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete template."); return; }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success(`"${name}" deleted.`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center py-16 text-center px-4"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 border border-primary/15">
          <BookmarkPlus className="size-6 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">No saved templates yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Open any project, hover a page in the sidebar, and click{" "}
          <span className="font-medium text-foreground">Save as template</span> to save it here.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {templates.length} saved template{templates.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-muted-foreground">Click to use</p>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        <AnimatePresence mode="popLayout">
          {templates.map((template, i) => (
            <UserTemplateCard
              key={template.id}
              template={template}
              index={i}
              isDeleting={deletingId === template.id}
              onSelect={() => onSelect(template.prompt || `Recreate this design: ${template.name}`)}
              onDelete={(e) => handleDelete(e, template.id, template.name)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function UserTemplateCard({
  template,
  index,
  isDeleting,
  onSelect,
  onDelete,
}: {
  template: UserTemplate;
  index: number;
  isDeleting: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const palette = extractPalette(template.rootStyles);
  const gradient = buildThumbnailGradient(palette);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" />

      {/* CSS thumbnail */}
      <div className="h-20 w-full relative overflow-hidden" style={{ background: gradient }}>
        {/* Mini nav */}
        <div
          className="absolute top-0 left-0 right-0 h-3 flex items-center px-2 gap-1"
          style={{ background: `color-mix(in oklch, ${palette.background} 85%, transparent)` }}
        >
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: palette.primary }} />
          <div className="h-1 w-6 rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 20%, transparent)` }} />
        </div>
        {/* Hero lines */}
        <div className="absolute top-5 left-0 right-0 flex flex-col items-center gap-1 px-2">
          <div className="h-2 w-2/3 rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 60%, transparent)` }} />
          <div className="h-1.5 w-1/2 rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 35%, transparent)` }} />
          <div className="h-2.5 w-8 rounded-full mt-1" style={{ background: palette.primary }} />
        </div>

        {/* Delete button */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={onDelete}
              disabled={isDeleting}
              className="absolute top-1.5 right-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-white hover:bg-destructive transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="size-2.5 animate-spin" />
              ) : (
                <Trash2 className="size-2.5" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* "Yours" badge */}
        <div className="absolute bottom-1 left-1.5 flex items-center gap-0.5 rounded-full bg-primary/80 px-1.5 py-0.5">
          <Sparkles className="size-2 text-white" />
          <span className="text-[8px] font-semibold text-white">Mine</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground truncate leading-tight">{template.name}</p>
        {template.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
            {template.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

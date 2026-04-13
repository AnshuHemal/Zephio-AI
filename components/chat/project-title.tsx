"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { renameProjectBySlugAction } from "@/app/action/action";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  slugId: string;
  onRename: (newTitle: string) => void;
  className?: string;
};

export default function ProjectTitle({ title, slugId, onRename, className }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep value in sync if title changes externally (e.g. AI sets it)
  useEffect(() => {
    if (!isEditing) setValue(title);
  }, [title, isEditing]);

  const startEdit = useCallback(() => {
    setValue(title);
    setIsEditing(true);
  }, [title]);

  const commit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === title) {
      setIsEditing(false);
      setValue(title);
      return;
    }

    setIsSaving(true);
    // Optimistic update
    onRename(trimmed);
    setIsEditing(false);

    const result = await renameProjectBySlugAction(slugId, trimmed);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      onRename(title); // revert
      setValue(title);
    }
  }, [value, title, slugId, onRename]);

  const cancel = useCallback(() => {
    setIsEditing(false);
    setValue(title);
  }, [title]);

  // Focus + select all when editing starts
  useEffect(() => {
    if (isEditing) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 20);
      return () => clearTimeout(t);
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { e.preventDefault(); cancel(); }
  };

  return (
    <div ref={containerRef} className={cn("flex items-center gap-1.5 min-w-0", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {isEditing ? (
          /* ── Edit mode ── */
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-1.5 min-w-0"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commit}
              maxLength={80}
              className={cn(
                "min-w-0 bg-transparent font-semibold tracking-tight text-foreground",
                "border-b-2 border-primary outline-none caret-primary",
                "text-sm leading-tight pb-px",
                // width grows with content
                "w-full max-w-[220px]"
              )}
              style={{ width: `${Math.max(value.length, 8)}ch` }}
            />

            {/* Confirm */}
            <button
              onMouseDown={(e) => { e.preventDefault(); commit(); }}
              className="shrink-0 flex items-center justify-center size-5 rounded text-green-500 hover:bg-green-500/10 transition-colors"
              title="Save (Enter)"
            >
              <Check className="size-3.5" />
            </button>

            {/* Cancel */}
            <button
              onMouseDown={(e) => { e.preventDefault(); cancel(); }}
              className="shrink-0 flex items-center justify-center size-5 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Cancel (Esc)"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ) : (
          /* ── Display mode ── */
          <motion.div
            key="display"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="group flex items-center gap-1.5 min-w-0 cursor-pointer"
            onClick={startEdit}
            title="Click to rename"
          >
            <h5
              className={cn(
                "font-semibold tracking-tight truncate text-sm",
                "text-foreground group-hover:text-primary transition-colors duration-150",
                isSaving && "opacity-60"
              )}
            >
              {title || "Untitled Project"}
            </h5>

            {/* Pencil icon — appears on hover */}
            <motion.span
              initial={false}
              animate={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
            >
              <Pencil className="size-3" />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

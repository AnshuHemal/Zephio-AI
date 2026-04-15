"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Position in viewport pixels */
  x: number;
  y: number;
  /** Container dimensions for boundary clamping */
  containerWidth: number;
  containerHeight: number;
  onSubmit: (authorName: string, text: string) => Promise<void>;
  onCancel: () => void;
};

const AUTHOR_KEY = "zephio_comment_author";

export default function CommentCompose({
  x,
  y,
  containerWidth,
  containerHeight,
  onSubmit,
  onCancel,
}: Props) {
  const [author, setAuthor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTHOR_KEY) ?? "";
    }
    return "";
  });
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Clamp so the card stays inside the container
  const CARD_W = 280;
  const CARD_H = 200;
  const clampedX = Math.min(x, containerWidth - CARD_W - 12);
  const clampedY = Math.min(y, containerHeight - CARD_H - 12);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const name = author.trim() || "Anonymous";
    localStorage.setItem(AUTHOR_KEY, name);
    setSubmitting(true);
    try {
      await onSubmit(name, text.trim());
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute z-50 w-[280px] rounded-xl border border-border bg-card shadow-2xl shadow-black/25 overflow-hidden"
      style={{ left: clampedX, top: clampedY }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Accent bar */}
      <div className="h-0.5 bg-linear-to-r from-primary/60 via-primary to-primary/60" />

      <div className="p-3 space-y-2.5">
        {/* Author name */}
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={40}
          className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />

        {/* Comment text */}
        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Leave a comment…"
          maxLength={1000}
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all leading-relaxed"
        />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            ⌘↵ to send
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="size-3.5" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all",
                text.trim() && !submitting
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {submitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Send className="size-3" />
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

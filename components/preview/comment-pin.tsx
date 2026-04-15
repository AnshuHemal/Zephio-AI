"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Trash2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageComment } from "@/types/comments";
import { formatDistanceToNow } from "@/lib/date-utils";

type Props = {
  comment: PageComment;
  index: number;
  isOwner: boolean;
  onResolve: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
};

export default function CommentPin({
  comment,
  index,
  isOwner,
  onResolve,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute z-30"
      style={{
        left: `${comment.xPct}%`,
        top: `${comment.yPct}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Pin button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ delay: index * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          "group relative flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95",
          comment.resolved
            ? "border-green-500 bg-green-500/20 text-green-600"
            : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        title={comment.authorName}
      >
        {comment.resolved ? (
          <Check className="size-3.5" />
        ) : (
          <span className="text-[10px] font-bold leading-none">{index + 1}</span>
        )}

        {/* Pulse ring for unresolved */}
        {!comment.resolved && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/30 pointer-events-none" />
        )}
      </motion.button>

      {/* Popover card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-8 top-0 z-40 w-64 rounded-xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className={cn(
              "h-0.5",
              comment.resolved
                ? "bg-linear-to-r from-green-500/60 via-green-500 to-green-500/60"
                : "bg-linear-to-r from-primary/60 via-primary to-primary/60"
            )} />

            <div className="p-3">
              {/* Author + time */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                    comment.resolved
                      ? "bg-green-500/15 text-green-600"
                      : "bg-primary/15 text-primary"
                  )}>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                    {comment.authorName}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(comment.createdAt)}
                </span>
              </div>

              {/* Comment text */}
              <p className="text-xs text-foreground leading-relaxed mb-3 whitespace-pre-wrap wrap-break-word">
                {comment.text}
              </p>

              {/* Status badge */}
              {comment.resolved && (
                <div className="flex items-center gap-1 mb-2 text-[10px] font-medium text-green-600">
                  <Check className="size-3" />
                  Resolved
                </div>
              )}

              {/* Owner actions */}
              {isOwner && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                  <button
                    onClick={() => onResolve(comment.id, !comment.resolved)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                      comment.resolved
                        ? "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                        : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    )}
                  >
                    <Check className="size-3" />
                    {comment.resolved ? "Unresolve" : "Resolve"}
                  </button>
                  <button
                    onClick={() => { onDelete(comment.id); setOpen(false); }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

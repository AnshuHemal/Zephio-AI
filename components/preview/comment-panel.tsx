"use client";

import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Check, Trash2, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageComment } from "@/types/comments";
import { formatDistanceToNow } from "@/lib/date-utils";

type Props = {
  comments: PageComment[];
  activePageId: string;
  isOwner: boolean;
  onResolve: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export default function CommentPanel({
  comments,
  activePageId,
  isOwner,
  onResolve,
  onDelete,
  onClose,
}: Props) {
  const pageComments = comments.filter((c) => c.pageId === activePageId);
  const open = pageComments.filter((c) => !c.resolved);
  const resolved = pageComments.filter((c) => c.resolved);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-background/95 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Comments</h3>
          {open.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {open.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {pageComments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 text-center px-4"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 border border-primary/15">
              <MessageCircle className="size-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No comments yet</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click anywhere on the preview to leave a comment.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Open comments */}
            {open.length > 0 && (
              <div className="mb-3">
                <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Open · {open.length}
                </p>
                <AnimatePresence initial={false}>
                  {open.map((comment, i) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      index={i}
                      isOwner={isOwner}
                      onResolve={onResolve}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Resolved comments */}
            {resolved.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Resolved · {resolved.length}
                </p>
                <AnimatePresence initial={false}>
                  {resolved.map((comment, i) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      index={i}
                      isOwner={isOwner}
                      onResolve={onResolve}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border px-4 py-2.5">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          {isOwner
            ? "Click a pin to resolve or delete comments"
            : "Click anywhere on the preview to add a comment"}
        </p>
      </div>
    </motion.aside>
  );
}

// ── Single comment item ───────────────────────────────────────────────────────
function CommentItem({
  comment,
  index,
  isOwner,
  onResolve,
  onDelete,
}: {
  comment: PageComment;
  index: number;
  isOwner: boolean;
  onResolve: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group mb-1.5 rounded-xl border p-3 transition-all duration-150",
        comment.resolved
          ? "border-border bg-muted/30 opacity-60"
          : "border-border bg-card hover:border-primary/20 hover:shadow-sm"
      )}
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold",
            comment.resolved
              ? "bg-muted text-muted-foreground"
              : "bg-primary/15 text-primary"
          )}>
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
            {comment.authorName}
          </span>
          {comment.resolved && (
            <span className="flex items-center gap-0.5 text-[9px] font-medium text-green-600">
              <CheckCheck className="size-2.5" />
              Resolved
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {formatDistanceToNow(comment.createdAt)}
        </span>
      </div>

      {/* Text */}
      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap wrap-break-word mb-2">
        {comment.text}
      </p>

      {/* Owner actions */}
      {isOwner && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onResolve(comment.id, !comment.resolved)}
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              comment.resolved
                ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                : "text-green-600 hover:bg-green-500/10"
            )}
          >
            <Check className="size-2.5" />
            {comment.resolved ? "Unresolve" : "Resolve"}
          </button>
          <button
            onClick={() => onDelete(comment.id)}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto"
          >
            <Trash2 className="size-2.5" />
            Delete
          </button>
        </div>
      )}
    </motion.div>
  );
}

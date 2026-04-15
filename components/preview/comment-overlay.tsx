"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { PageComment } from "@/types/comments";
import CommentPin from "./comment-pin";
import CommentCompose from "./comment-compose";
import { cn } from "@/lib/utils";

type PendingPin = {
  /** Viewport pixel position */
  x: number;
  y: number;
  /** Percentage position relative to the overlay */
  xPct: number;
  yPct: number;
};

type Props = {
  comments: PageComment[];
  activePageId: string;
  commentMode: boolean;
  isOwner: boolean;
  onAddComment: (xPct: number, yPct: number, authorName: string, text: string) => Promise<void>;
  onResolve: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
};

export default function CommentOverlay({
  comments,
  activePageId,
  commentMode,
  isOwner,
  onAddComment,
  onResolve,
  onDelete,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<PendingPin | null>(null);

  const pageComments = comments.filter((c) => c.pageId === activePageId);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!commentMode) return;
      // Don't open compose if clicking on an existing pin
      const target = e.target as HTMLElement;
      if (target.closest("[data-comment-pin]")) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width) * 100;
      const yPct = (y / rect.height) * 100;

      setPending({ x, y, xPct, yPct });
    },
    [commentMode]
  );

  const handleSubmit = async (authorName: string, text: string) => {
    if (!pending) return;
    await onAddComment(pending.xPct, pending.yPct, authorName, text);
    setPending(null);
  };

  const containerRect = containerRef.current?.getBoundingClientRect();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full",
        commentMode && "cursor-crosshair"
      )}
      onClick={handleClick}
    >
      {/* The iframe / page content */}
      {children}

      {/* Comment pins overlay — pointer-events-none so iframe scrolls normally */}
      {commentMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative h-full w-full pointer-events-none">
            <AnimatePresence>
              {pageComments.map((comment, i) => (
                <div key={comment.id} data-comment-pin className="pointer-events-auto">
                  <CommentPin
                    comment={comment}
                    index={i}
                    isOwner={isOwner}
                    onResolve={onResolve}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Compose form */}
      <AnimatePresence>
        {pending && (
          <CommentCompose
            key="compose"
            x={pending.x}
            y={pending.y}
            containerWidth={containerRect?.width ?? 800}
            containerHeight={containerRect?.height ?? 600}
            onSubmit={handleSubmit}
            onCancel={() => setPending(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

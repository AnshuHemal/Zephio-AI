"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { PageType } from "@/types/project";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Download, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { downloadPage } from "@/lib/export";
import { Skeleton } from "@/components/ui/skeleton";
import { renamePageAction } from "@/app/action/action";
import { toast } from "sonner";

type Props = {
  pages: PageType[];
  selectedPageId: string | null;
  deletingPageId: string | null;
  onSelectPage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onReorder: (reordered: PageType[]) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  isProjectLoading?: boolean;
};

export default function PageSidebar({
  pages,
  selectedPageId,
  deletingPageId,
  onSelectPage,
  onDeletePage,
  onReorder,
  onRenamePage,
  isProjectLoading,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const startRename = (pageId: string) => {
    if (pages.find(p => p.id === pageId)?.isLoading) return;
    setRenamingId(pageId);
  };

  const commitRename = async (pageId: string, newName: string, originalName: string) => {
    setRenamingId(null);
    const trimmed = newName.trim();
    if (!trimmed || trimmed === originalName) return;

    // Optimistic update
    onRenamePage(pageId, trimmed);

    const result = await renamePageAction(pageId, trimmed);
    if (result.error) {
      toast.error(result.error);
      // Revert on failure
      onRenamePage(pageId, originalName);
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (pages.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 p-2">
      <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Pages
      </p>
      <Reorder.Group
        axis="y"
        values={pages}
        onReorder={onReorder}
        className="flex flex-col gap-1"
        as="div"
      >
        <AnimatePresence initial={false}>
          {pages.map((page, index) => {
            const isSelected = selectedPageId === page.id;
            const isDeleting = deletingPageId === page.id;
            const isDragging = draggingId === page.id;
            const isRenaming = renamingId === page.id;

            return (
              <Reorder.Item
                key={page.id}
                value={page}
                as="div"
                onDragStart={() => setDraggingId(page.id)}
                onDragEnd={() => setDraggingId(null)}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg border px-2 py-2.5 select-none transition-all duration-150",
                  isRenaming
                    ? "border-primary/50 bg-primary/5 shadow-sm cursor-default"
                    : isSelected
                    ? "border-primary/40 bg-primary/5 shadow-sm cursor-pointer"
                    : "border-transparent hover:border-border hover:bg-accent/50 cursor-pointer",
                  isDragging && "shadow-lg scale-[1.02] z-50 border-border bg-card"
                )}
                onClick={() => {
                  if (isRenaming) return;
                  if (!page.isLoading) onSelectPage(page.id);
                }}
              >
                {/* Drag handle — hidden while renaming */}
                <div className={cn(
                  "shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors",
                  isRenaming && "invisible"
                )}>
                  <GripVertical className="size-3.5" />
                </div>

                {/* Page number badge */}
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold transition-colors",
                  isSelected || isRenaming
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>

                {/* Page name / rename input */}
                <div className="flex-1 min-w-0">
                  {page.isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <Spinner className="size-3" />
                      <span className="text-xs text-muted-foreground truncate">Generating…</span>
                    </div>
                  ) : isRenaming ? (
                    <RenameInput
                      initialValue={page.name}
                      onCommit={(val) => commitRename(page.id, val, page.name)}
                      onCancel={() => setRenamingId(null)}
                    />
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-medium truncate block",
                        isSelected
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startRename(page.id);
                      }}
                      title="Double-click to rename"
                    >
                      {page.name}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {!isRenaming && (
                  <div className={cn(
                    "flex items-center gap-0.5 transition-opacity duration-150",
                    isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                      title="Rename page"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(page.id);
                      }}
                      disabled={page.isLoading}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 shrink-0"
                      title="Download page"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPage(page);
                      }}
                      disabled={page.isLoading}
                    >
                      <Download className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 shrink-0 hover:text-destructive"
                      title="Delete page"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.id);
                      }}
                      disabled={isDeleting || page.isLoading}
                    >
                      {isDeleting ? <Spinner className="size-3" /> : <Trash2 className="size-3" />}
                    </Button>
                  </div>
                )}
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      <p className="px-1 pt-2 text-[10px] text-muted-foreground/50 text-center">
        Double-click a name to rename
      </p>
    </div>
  );
}

// ── Inline rename input ───────────────────────────────────────────────────────
function RenameInput({
  initialValue,
  onCommit,
  onCancel,
}: {
  initialValue: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus and select all on mount
    const t = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
    return () => clearTimeout(t);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // prevent Reorder from intercepting
    if (e.key === "Enter") onCommit(value);
    if (e.key === "Escape") onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-1 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCommit(value)}
        maxLength={60}
        className="flex-1 min-w-0 bg-transparent text-xs font-medium text-foreground outline-none border-b border-primary pb-px caret-primary"
        style={{ width: "100%" }}
      />
      <button
        onMouseDown={(e) => { e.preventDefault(); onCommit(value); }}
        className="shrink-0 text-green-500 hover:text-green-600 transition-colors"
        title="Save"
      >
        <Check className="size-3" />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); onCancel(); }}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        title="Cancel"
      >
        <X className="size-3" />
      </button>
    </motion.div>
  );
}

"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { PageType } from "@/types/project";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Download, Pencil, Check, X, History, Copy, Plus, Wand2, FileText, Code2, Braces, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { downloadPage } from "@/lib/export";
import { Skeleton } from "@/components/ui/skeleton";
import { renamePageAction, duplicatePageAction, addBlankPageAction } from "@/app/action/action";
import { getHTMLWrapper } from "@/lib/page-wrapper";
import { toast } from "sonner";
import PageVersionDrawer from "./page-version-drawer";
import PagePreviewTooltip from "./page-preview-tooltip";
import SaveTemplateDialog from "./save-template-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  pages: PageType[];
  selectedPageId: string | null;
  deletingPageId: string | null;
  slugId: string;
  onSelectPage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onDuplicatePage: (sourcePageId: string, page: PageType) => void;
  onAddPage: (page: PageType) => void;
  onGeneratePage: () => void;
  onReorder: (reordered: PageType[]) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onPageRestored: (updatedPage: PageType) => void;
  isProjectLoading?: boolean;
  isPro?: boolean;
};

export default function PageSidebar({
  pages,
  selectedPageId,
  deletingPageId,
  slugId,
  onSelectPage,
  onDeletePage,
  onDuplicatePage,
  onAddPage,
  onGeneratePage,
  onReorder,
  onRenamePage,
  onPageRestored,
  isProjectLoading,
  isPro = false,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [historyPageId, setHistoryPageId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [addingBlank, setAddingBlank] = useState(false);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [copiedHtmlId, setCopiedHtmlId] = useState<string | null>(null);
  const [copiedCssId, setCopiedCssId] = useState<string | null>(null);
  const [saveTemplatePageId, setSaveTemplatePageId] = useState<string | null>(null);

  const handleCopyHtml = (e: React.MouseEvent, page: PageType) => {
    e.stopPropagation();
    const html = getHTMLWrapper(page.htmlContent, page.name, page.rootStyles, page.id);
    navigator.clipboard.writeText(html);
    setCopiedHtmlId(page.id);
    toast.success("HTML copied!");
    setTimeout(() => setCopiedHtmlId(null), 2000);
  };

  const handleCopyCss = (e: React.MouseEvent, page: PageType) => {
    e.stopPropagation();
    if (!page.rootStyles?.trim()) { toast.error("No CSS variables found."); return; }
    const cssBlock = `:root {\n${page.rootStyles
      .split(";").map((l) => l.trim()).filter(Boolean).map((l) => `  ${l};`).join("\n")}\n}`;
    navigator.clipboard.writeText(cssBlock);
    setCopiedCssId(page.id);
    toast.success("CSS variables copied!");
    setTimeout(() => setCopiedCssId(null), 2000);
  };

  const historyPage = pages.find((p) => p.id === historyPageId) ?? null;

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

  const handleDuplicate = async (page: PageType) => {
    setDuplicatingId(page.id);
    const result = await duplicatePageAction(page.id);
    setDuplicatingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.page) {
      onDuplicatePage(page.id, result.page);
      toast.success(`"${result.page.name}" created`);
    }
  };

  const handleAddBlank = async () => {
    setAddPopoverOpen(false);
    setAddingBlank(true);
    const name = `Page ${pages.length + 1}`;
    const result = await addBlankPageAction(slugId, name);
    setAddingBlank(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.page) {
      onAddPage(result.page);
      toast.success(`"${result.page.name}" added`);
    }
  };

  const handleGeneratePage = () => {
    setAddPopoverOpen(false);
    onGeneratePage();
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

  return (
    <div className="flex flex-col gap-1 p-2">
      {pages.length > 0 && (
        <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pages
        </p>
      )}
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
              >
                <PagePreviewTooltip
                  name={page.name}
                  rootStyles={page.rootStyles}
                  isLoading={page.isLoading}
                >
                  <div
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(page.id);
                          }}
                          disabled={page.isLoading}
                        >
                          <Pencil className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Rename</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistoryPageId(page.id);
                          }}
                          disabled={page.isLoading}
                        >
                          <History className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Version history</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(page);
                          }}
                          disabled={page.isLoading || duplicatingId === page.id}
                        >
                          {duplicatingId === page.id ? (
                            <Spinner className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Duplicate page</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPage(page, isPro);
                          }}
                          disabled={page.isLoading}
                        >
                          <Download className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Download</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSaveTemplatePageId(page.id);
                          }}
                          disabled={page.isLoading || !page.htmlContent}
                        >
                          <BookmarkPlus className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Save as template</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleCopyCss(e, page)}
                          disabled={page.isLoading}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {copiedCssId === page.id ? (
                              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                <Check className="size-3 text-green-500" />
                              </motion.span>
                            ) : (
                              <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                <Braces className="size-3" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Copy CSS variables</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleCopyHtml(e, page)}
                          disabled={page.isLoading}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {copiedHtmlId === page.id ? (
                              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                <Check className="size-3 text-green-500" />
                              </motion.span>
                            ) : (
                              <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                <Code2 className="size-3" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Copy HTML</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 shrink-0 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(page.id);
                          }}
                          disabled={isDeleting || page.isLoading}
                        >
                          {isDeleting ? <Spinner className="size-3" /> : <Trash2 className="size-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Delete</TooltipContent>
                    </Tooltip>
                  </div>
                )}
                  </div>
                </PagePreviewTooltip>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {pages.length > 0 && (
        <p className="px-1 pt-2 text-[10px] text-muted-foreground/50 text-center">
          Double-click a name to rename
        </p>
      )}

      {/* ── Add page button ── */}
      <div className="mt-2 px-1">
        <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "group flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-2 py-2 text-xs font-medium text-muted-foreground transition-all duration-150",
                "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                addingBlank && "opacity-60 pointer-events-none"
              )}
              disabled={addingBlank}
            >
              {addingBlank ? (
                <Spinner className="size-3" />
              ) : (
                <Plus className="size-3 transition-transform duration-200 group-hover:rotate-90" />
              )}
              {addingBlank ? "Adding…" : "Add page"}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="end"
            sideOffset={8}
            className="w-48 p-1.5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-0.5"
            >
              <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Add page
              </p>
              <button
                onClick={handleAddBlank}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <FileText className="size-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Blank page</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Empty canvas to describe</p>
                </div>
              </button>
              <button
                onClick={handleGeneratePage}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/8">
                  <Wand2 className="size-3 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Generate with AI</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Describe in the chat</p>
                </div>
              </button>
            </motion.div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Version history drawer — rendered outside the scroll container */}
      <PageVersionDrawer
        open={!!historyPageId}
        page={historyPage}
        onClose={() => setHistoryPageId(null)}
        onRestored={(updatedPage) => {
          onPageRestored(updatedPage);
          setHistoryPageId(null);
        }}
      />

      {/* Save as template dialog */}
      {saveTemplatePageId && (() => {
        const templatePage = pages.find(p => p.id === saveTemplatePageId);
        return templatePage ? (
          <SaveTemplateDialog
            page={templatePage}
            open={!!saveTemplatePageId}
            onClose={() => setSaveTemplatePageId(null)}
          />
        ) : null;
      })()}
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

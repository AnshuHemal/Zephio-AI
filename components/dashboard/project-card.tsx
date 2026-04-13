"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/date-utils";
import { getHTMLWrapper } from "@/lib/page-wrapper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, Pencil, Copy, Trash2,
  ExternalLink, FileStack, Clock,
} from "lucide-react";
import type { DashboardProject } from "./dashboard-client";

type Props = {
  project: DashboardProject;
  viewMode: "grid" | "list";
  index: number;
  onRename: (id: string, title: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
};

export default function ProjectCard({
  project, viewMode, index, onRename, onDelete, onDuplicate,
}: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const commitRename = async () => {
    if (renameValue.trim() === project.title) { setIsRenaming(false); return; }
    const ok = await onRename(project.id, renameValue);
    if (!ok) setRenameValue(project.title);
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(project.id);
    setIsDeleting(false);
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    await onDuplicate(project.id);
    setIsDuplicating(false);
  };

  const thumbnailHtml = project.thumbnail
    ? getHTMLWrapper(
        project.thumbnail.htmlContent,
        project.thumbnail.name,
        project.thumbnail.rootStyles,
        project.thumbnail.id
      )
    : null;

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
      >
        {/* Mini thumbnail */}
        <div className="relative h-12 w-16 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
          {thumbnailHtml ? (
            <iframe
              srcDoc={thumbnailHtml}
              sandbox="allow-scripts"
              className="absolute inset-0 w-[400%] h-[400%] origin-top-left pointer-events-none"
              style={{ transform: "scale(0.25)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileStack className="size-4 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setRenameValue(project.title); setIsRenaming(false); }
              }}
              className="w-full bg-transparent border-b border-primary text-sm font-semibold text-foreground outline-none pb-0.5"
            />
          ) : (
            <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
          )}
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatDistanceToNow(project.updatedAt || project.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              {project.pageCount} page{project.pageCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" asChild>
            <Link href={`/project/${project.slugId}`}>
              <ExternalLink className="size-3" />
              Open
            </Link>
          </Button>
          <CardMenu
            onRename={() => setIsRenaming(true)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            isDuplicating={isDuplicating}
          />
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      <Link href={`/project/${project.slugId}`} className="block">
        <div className="relative h-44 bg-muted overflow-hidden border-b border-border">
          {thumbnailHtml ? (
            <iframe
              srcDoc={thumbnailHtml}
              sandbox="allow-scripts"
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: "200%",
                height: "200%",
                transform: "scale(0.5)",
                transformOrigin: "top left",
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <FileStack className="size-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground/50">No pages yet</p>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium flex items-center gap-1.5">
              <ExternalLink className="size-4" />
              Open project
            </span>
          </div>
        </div>
      </Link>

      {/* Card footer */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") { setRenameValue(project.title); setIsRenaming(false); }
                }}
                className="w-full bg-transparent border-b border-primary text-sm font-semibold text-foreground outline-none pb-0.5"
                onClick={(e) => e.preventDefault()}
              />
            ) : (
              <p
                className="text-sm font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                onDoubleClick={() => setIsRenaming(true)}
                title="Double-click to rename"
              >
                {project.title}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {formatDistanceToNow(project.updatedAt || project.createdAt)}
              </span>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground">
                {project.pageCount} page{project.pageCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <CardMenu
            onRename={() => setIsRenaming(true)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            isDuplicating={isDuplicating}
          />
        </div>
      </div>
    </motion.div>
  );
}

function CardMenu({
  onRename, onDuplicate, onDelete, isDeleting, isDuplicating,
}: {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isDuplicating: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.preventDefault()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onRename} className="gap-2 cursor-pointer">
          <Pencil className="size-3.5" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDuplicate}
          disabled={isDuplicating}
          className="gap-2 cursor-pointer"
        >
          {isDuplicating ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Copy className="size-3.5" />}
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          disabled={isDeleting}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          {isDeleting ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="size-3.5" />}
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

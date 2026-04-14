"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal, Pencil, Copy, Trash2,
  ExternalLink, Clock, Layers, FolderInput, FolderMinus,
} from "lucide-react";
import type { DashboardProject } from "./dashboard-client";
import ProjectThumbnail from "./project-thumbnail";
import { type Folder, FOLDER_COLORS } from "@/lib/folders";

type Props = {
  project: DashboardProject;
  viewMode: "grid" | "list";
  index: number;
  onRename: (id: string, title: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  folders: Folder[];
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
};

export default function ProjectCard({
  project, viewMode, index, onRename, onDelete, onDuplicate,
  folders, onMoveToFolder,
}: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  }, [isRenaming]);

  const commitRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === project.title) {
      setRenameValue(project.title);
      setIsRenaming(false);
      return;
    }
    const ok = await onRename(project.id, trimmed);
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

  // ── List view ─────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200 active:scale-[0.99]"
      >
        {/* Mini thumbnail */}
        <Link
          href={`/project/${project.slugId}`}
          className="relative h-10 w-14 sm:h-12 sm:w-16 shrink-0 rounded-lg overflow-hidden border border-border bg-muted"
        >
          <ProjectThumbnail thumbnail={project.thumbnail} variant="list" />
        </Link>

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
              className="w-full bg-transparent border-b border-primary text-sm font-semibold text-foreground outline-none pb-0.5 caret-primary"
            />
          ) : (
            <p className="text-sm font-semibold text-foreground truncate leading-tight">
              {project.title}
            </p>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3 shrink-0" />
              {formatDistanceToNow(project.updatedAt || project.createdAt)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="size-3 shrink-0" />
              {project.pageCount} page{project.pageCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Actions — always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 px-2 hidden sm:flex"
            asChild
          >
            <Link href={`/project/${project.slugId}`}>
              <ExternalLink className="size-3" />
              Open
            </Link>
          </Button>
          <CardMenu
            projectSlugId={project.slugId}
            onRename={() => setIsRenaming(true)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            isDuplicating={isDuplicating}
            folders={folders}
            currentFolderId={project.folderId}
            onMoveToFolder={(folderId) => onMoveToFolder(project.id, folderId)}
          />
        </div>
      </motion.div>
    );
  }

  // ── Grid view ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-200 active:scale-[0.99]"
    >
      {/* Thumbnail */}
      <Link href={`/project/${project.slugId}`} className="block">
        <div className="relative h-36 sm:h-44 bg-muted overflow-hidden border-b border-border">
          <ProjectThumbnail thumbnail={project.thumbnail} variant="grid" />

          {/* Hover overlay — desktop only */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 hidden sm:flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium flex items-center gap-1.5">
              <ExternalLink className="size-4" />
              Open project
            </span>
          </div>

          {/* Page count badge */}
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
              <Layers className="size-2.5" />
              {project.pageCount}
            </span>
          </div>
        </div>
      </Link>

      {/* Card footer */}
      <div className="p-3 sm:p-4">
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
                className="w-full bg-transparent border-b border-primary text-sm font-semibold text-foreground outline-none pb-0.5 caret-primary"
                onClick={(e) => e.preventDefault()}
              />
            ) : (
              <p
                className="text-sm font-semibold text-foreground truncate leading-tight cursor-pointer hover:text-primary transition-colors"
                onDoubleClick={() => setIsRenaming(true)}
                title="Double-click to rename"
              >
                {project.title}
              </p>
            )}
            <span className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="size-3 shrink-0" />
              {formatDistanceToNow(project.updatedAt || project.createdAt)}
            </span>
          </div>

          <CardMenu
            projectSlugId={project.slugId}
            onRename={() => setIsRenaming(true)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            isDuplicating={isDuplicating}
            folders={folders}
            currentFolderId={project.folderId}
            onMoveToFolder={(folderId) => onMoveToFolder(project.id, folderId)}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Card context menu ─────────────────────────────────────────────────────────
function CardMenu({
  projectSlugId,
  onRename,
  onDuplicate,
  onDelete,
  isDeleting,
  isDuplicating,
  folders,
  currentFolderId,
  onMoveToFolder,
}: {
  projectSlugId: string;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isDuplicating: boolean;
  folders: Folder[];
  currentFolderId: string | null;
  onMoveToFolder: (folderId: string | null) => void;
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
      <DropdownMenuContent align="end" className="w-48">
        {/* Open — shown in mobile dropdown since hover state isn't available */}
        <DropdownMenuItem asChild className="gap-2 cursor-pointer sm:hidden">
          <Link href={`/project/${projectSlugId}`}>
            <ExternalLink className="size-3.5" />
            Open project
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="sm:hidden" />

        <DropdownMenuItem onClick={onRename} className="gap-2 cursor-pointer">
          <Pencil className="size-3.5" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDuplicate}
          disabled={isDuplicating}
          className="gap-2 cursor-pointer"
        >
          {isDuplicating ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Copy className="size-3.5" />
          )}
          Duplicate
        </DropdownMenuItem>

        {/* Move to folder */}
        {folders.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              <FolderInput className="size-3.5" />
              Move to folder
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              {currentFolderId && (
                <>
                  <DropdownMenuItem
                    onClick={() => onMoveToFolder(null)}
                    className="gap-2 cursor-pointer text-muted-foreground"
                  >
                    <FolderMinus className="size-3.5" />
                    Remove from folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {folders.map((f) => {
                const colors = FOLDER_COLORS[f.color];
                const isCurrent = f.id === currentFolderId;
                return (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => onMoveToFolder(f.id)}
                    disabled={isCurrent}
                    className="gap-2 cursor-pointer"
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", colors.dot)} />
                    <span className="truncate">{f.name}</span>
                    {isCurrent && <span className="ml-auto text-[10px] text-muted-foreground">current</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          disabled={isDeleting}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          {isDeleting ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

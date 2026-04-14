"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Folder, Plus, MoreHorizontal,
  Pencil, Trash2, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Folder as FolderType,
  type FolderColor,
  FOLDER_COLORS,
} from "@/lib/folders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  folders: FolderType[];
  activeFolder: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (name: string, color: FolderColor) => void;
  onRenameFolder: (id: string, name: string) => void;
  onRecolorFolder: (id: string, color: FolderColor) => void;
  onDeleteFolder: (id: string) => void;
  projectCounts: Record<string, number>;
  totalCount: number;
  unfiledCount: number;
};

export default function FolderSidebar({
  folders,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onRecolorFolder,
  onDeleteFolder,
  projectCounts,
  totalCount,
  unfiledCount,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<FolderColor>("blue");
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) setTimeout(() => createInputRef.current?.focus(), 50);
  }, [creating]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) { setCreating(false); return; }
    onCreateFolder(name, newColor);
    setNewName("");
    setNewColor("blue");
    setCreating(false);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-52 shrink-0 flex flex-col gap-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Folders
        </span>
        <button
          onClick={() => setCreating(true)}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="New folder"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* All projects */}
      <FolderRow
        label="All projects"
        count={totalCount}
        active={activeFolder === null}
        onClick={() => onSelectFolder(null)}
        icon={<Folder className="size-3.5" />}
      />

      {/* Unfiled */}
      {unfiledCount > 0 && (
        <FolderRow
          label="Unfiled"
          count={unfiledCount}
          active={activeFolder === "unfiled"}
          onClick={() => onSelectFolder("unfiled")}
          icon={<Folder className="size-3.5 opacity-40" />}
          muted
        />
      )}

      {/* Separator */}
      {folders.length > 0 && <div className="my-1 h-px bg-border mx-2" />}

      {/* Folder list */}
      <AnimatePresence initial={false}>
        {folders.map((folder) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <EditableFolderRow
              folder={folder}
              count={projectCounts[folder.id] ?? 0}
              active={activeFolder === folder.id}
              onClick={() => onSelectFolder(folder.id)}
              onRename={(name) => onRenameFolder(folder.id, name)}
              onRecolor={(color) => onRecolorFolder(folder.id, color)}
              onDelete={() => onDeleteFolder(folder.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* New folder input */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-1 mt-1 rounded-lg border border-primary/30 bg-primary/5 p-2 space-y-2">
              <input
                ref={createInputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") { setCreating(false); setNewName(""); }
                }}
                placeholder="Folder name…"
                maxLength={40}
                className="w-full bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
              {/* Color picker */}
              <div className="flex items-center gap-1 flex-wrap">
                {(Object.keys(FOLDER_COLORS) as FolderColor[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={cn(
                      "h-4 w-4 rounded-full transition-all",
                      FOLDER_COLORS[c].dot,
                      newColor === c
                        ? "ring-2 ring-offset-1 ring-foreground/40 scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
                >
                  <Check className="size-3" />
                  Create
                </button>
                <button
                  onClick={() => { setCreating(false); setNewName(""); }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3" />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

// ── Simple folder row ─────────────────────────────────────────────────────────
function FolderRow({
  label, count, active, onClick, icon, muted = false,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-all duration-150",
        active
          ? "bg-primary/8 text-primary"
          : muted
          ? "text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/50"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <span className={cn("shrink-0", active ? "text-primary" : "")}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <span className={cn("text-[10px] tabular-nums", active ? "text-primary/70" : "text-muted-foreground/50")}>
        {count}
      </span>
    </button>
  );
}

// ── Editable folder row ───────────────────────────────────────────────────────
function EditableFolderRow({
  folder, count, active, onClick, onRename, onRecolor, onDelete,
}: {
  folder: FolderType;
  count: number;
  active: boolean;
  onClick: () => void;
  onRename: (name: string) => void;
  onRecolor: (color: FolderColor) => void;
  onDelete: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const colors = FOLDER_COLORS[folder.color];

  useEffect(() => {
    if (renaming) setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
  }, [renaming]);

  const commitRename = () => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== folder.name) onRename(trimmed);
    else setRenameVal(folder.name);
    setRenaming(false);
  };

  return (
    <div
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer",
        active
          ? `${colors.bg} ${colors.border} border text-foreground`
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
      onClick={() => { if (!renaming) onClick(); }}
    >
      <span className={cn("h-2 w-2 rounded-full shrink-0", colors.dot)} />

      {renaming ? (
        <input
          ref={inputRef}
          value={renameVal}
          onChange={(e) => setRenameVal(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setRenameVal(folder.name); setRenaming(false); }
          }}
          onClick={(e) => e.stopPropagation()}
          maxLength={40}
          className="flex-1 min-w-0 bg-transparent text-xs font-medium text-foreground outline-none border-b border-primary pb-px caret-primary"
        />
      ) : (
        <span className="flex-1 truncate">{folder.name}</span>
      )}

      {!renaming && (
        <span className="text-[10px] tabular-nums text-muted-foreground/50 group-hover:opacity-0 transition-opacity">
          {count}
        </span>
      )}

      {!renaming && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="opacity-0 group-hover:opacity-100 flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-all">
              <MoreHorizontal className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => setRenaming(true)} className="gap-2 cursor-pointer text-xs">
              <Pencil className="size-3.5" />
              Rename
            </DropdownMenuItem>
            <div className="px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Color</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(FOLDER_COLORS) as FolderColor[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => onRecolor(c)}
                    className={cn(
                      "h-4 w-4 rounded-full transition-all",
                      FOLDER_COLORS[c].dot,
                      folder.color === c
                        ? "ring-2 ring-offset-1 ring-foreground/40 scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" />
              Delete folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/**
 * Project Folders — shared types and color palette
 *
 * Data is stored in the `folders` DB table.
 * API routes: /api/folders (GET, POST)
 *             /api/folders/[folderId] (PATCH, DELETE)
 * Server actions: createFolderAction, renameFolderAction,
 *                 recolorFolderAction, deleteFolderAction,
 *                 moveProjectToFolderAction
 */

export type FolderColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink";

export const FOLDER_COLORS: Record<FolderColor, { bg: string; border: string; dot: string }> = {
  gray:   { bg: "bg-muted/60",        border: "border-border",        dot: "bg-muted-foreground/60" },
  red:    { bg: "bg-red-500/8",       border: "border-red-500/20",    dot: "bg-red-500" },
  orange: { bg: "bg-orange-500/8",    border: "border-orange-500/20", dot: "bg-orange-500" },
  yellow: { bg: "bg-yellow-500/8",    border: "border-yellow-500/20", dot: "bg-yellow-500" },
  green:  { bg: "bg-green-500/8",     border: "border-green-500/20",  dot: "bg-green-500" },
  blue:   { bg: "bg-blue-500/8",      border: "border-blue-500/20",   dot: "bg-blue-500" },
  purple: { bg: "bg-purple-500/8",    border: "border-purple-500/20", dot: "bg-purple-500" },
  pink:   { bg: "bg-pink-500/8",      border: "border-pink-500/20",   dot: "bg-pink-500" },
};

export type Folder = {
  id: string;
  name: string;
  color: FolderColor;
  createdAt: string;
};

export type ActivityEventType =
  | "page_generated"
  | "page_regenerated"
  | "page_renamed"
  | "page_deleted"
  | "page_duplicated"
  | "page_added"
  | "page_restored"
  | "project_exported"
  | "share_link_copied"
  | "project_created";

export type ActivityEvent = {
  id: string;
  projectId: string;
  eventType: ActivityEventType;
  /** Human-readable label, e.g. "Hero Section regenerated" */
  label: string;
  /** Optional extra metadata (page name, version number, etc.) */
  meta: Record<string, string | number | boolean> | null;
  createdAt: string;
};

/** Icon + color mapping for each event type */
export const ACTIVITY_CONFIG: Record<
  ActivityEventType,
  { icon: string; color: string; verb: string }
> = {
  page_generated:    { icon: "Sparkles",   color: "text-primary",     verb: "Generated"    },
  page_regenerated:  { icon: "RefreshCw",  color: "text-blue-500",    verb: "Regenerated"  },
  page_renamed:      { icon: "Pencil",     color: "text-amber-500",   verb: "Renamed"      },
  page_deleted:      { icon: "Trash2",     color: "text-destructive", verb: "Deleted"      },
  page_duplicated:   { icon: "Copy",       color: "text-violet-500",  verb: "Duplicated"   },
  page_added:        { icon: "Plus",       color: "text-green-500",   verb: "Added"        },
  page_restored:     { icon: "History",    color: "text-cyan-500",    verb: "Restored"     },
  project_exported:  { icon: "Download",   color: "text-orange-500",  verb: "Exported"     },
  share_link_copied: { icon: "Link2",      color: "text-pink-500",    verb: "Shared"       },
  project_created:   { icon: "FolderPlus", color: "text-emerald-500", verb: "Created"      },
};

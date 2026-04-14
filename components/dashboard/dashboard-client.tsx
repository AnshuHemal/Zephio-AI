"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "./project-card";
import EmptyDashboard from "./empty-dashboard";
import FolderSidebar from "./folder-sidebar";
import {
  renameProjectAction,
  deleteProjectAction,
  duplicateProjectAction,
  createFolderAction,
  renameFolderAction,
  recolorFolderAction,
  deleteFolderAction,
  moveProjectToFolderAction,
} from "@/app/action/dashboard-actions";
import { signOutAction } from "@/app/auth/actions";
import { Plus, Search, LogOut, LayoutGrid, List, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import KeyboardShortcutsProvider from "@/components/keyboard-shortcuts-provider";
import { getShortcutDisplay } from "@/hooks/use-keyboard-shortcuts";
import ManageBillingButton from "@/components/credits/manage-billing-button";
import UpgradeButton from "@/components/credits/upgrade-button";
import { type Folder, type FolderColor } from "@/lib/folders";
import { getLastOpened, clearLastOpened, type LastOpenedEntry } from "@/lib/last-opened";
import ContinueBanner from "./continue-banner";
import OnboardingChecklist from "./onboarding-checklist";
import {
  getOnboardingState,
  isChecklistComplete,
  completeStep,
  type OnboardingState,
} from "@/lib/onboarding-checklist";

export type DashboardProject = {
  id: string;
  title: string;
  slugId: string;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  folderId: string | null;
  thumbnail: {
    id: string;
    name: string;
    rootStyles: string;
  } | null;
};

type ViewMode = "grid" | "list";

export default function DashboardClient({ user }: { user: Record<string, unknown> }) {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPending, startTransition] = useTransition();
  const [searchOpen, setSearchOpen] = useState(false);
  const [plan, setPlan] = useState<string>("free");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [lastOpened, setLastOpenedState] = useState<LastOpenedEntry | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [checklistState, setChecklistState] = useState<OnboardingState | null>(null);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  // Read last-opened and checklist state from localStorage on mount
  // Also re-read checklist when the tab becomes visible (user returns from canvas)
  const refreshChecklist = useCallback(() => {
    const onboarding = getOnboardingState();
    if (!onboarding.dismissed && !isChecklistComplete(onboarding)) {
      setChecklistState(onboarding);
    } else {
      setChecklistState(null);
    }
  }, []);

  useEffect(() => {
    const entry = getLastOpened("current_user");
    if (entry) setLastOpenedState(entry);
    refreshChecklist();
  }, [refreshChecklist]);

  // Re-read checklist when user returns to this tab from the canvas
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshChecklist();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refreshChecklist]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch plan + upgrade toast
  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.plan) setPlan(d.plan); })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
      toast.success("🎉 Welcome to Pro! Unlimited generations are now active.", { duration: 6000 });
      window.history.replaceState({}, "", "/dashboard");
    }
    if (params.get("upgrade_cancelled") === "1") {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  // Fetch folders from DB
  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      if (!res.ok) return;
      const data = await res.json();
      setFolders(data.folders ?? []);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const fetchProjects = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      const res = await fetch(`/api/dashboard?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(debouncedSearch); }, [debouncedSearch, fetchProjects]);

  // Auto-complete "create_project" step when projects exist
  useEffect(() => {
    if (projects.length > 0) {
      completeStep("create_project");
      refreshChecklist();
    }
  }, [projects.length, refreshChecklist]);

  // ── Project mutations ─────────────────────────────────────────────────────
  const handleRename = async (projectId: string, newTitle: string) => {
    const result = await renameProjectAction(projectId, newTitle);
    if (result.error) { toast.error(result.error); return false; }
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, title: result.title! } : p));
    toast.success("Project renamed");
    return true;
  };

  const handleDelete = async (projectId: string) => {
    const result = await deleteProjectAction(projectId);
    if (result.error) { toast.error(result.error); return; }
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast.success("Project deleted");
  };

  const handleDuplicate = async (projectId: string) => {
    toast.loading("Duplicating project...", { id: "dup" });
    const result = await duplicateProjectAction(projectId);
    toast.dismiss("dup");
    if (result.error) { toast.error(result.error); return; }
    toast.success("Project duplicated");
    fetchProjects(debouncedSearch);
  };

  // ── Folder mutations ──────────────────────────────────────────────────────
  const handleCreateFolder = async (name: string, color: FolderColor) => {
    const result = await createFolderAction(name, color);
    if (result.error) { toast.error(result.error); return; }
    const newFolder = result.folder as Folder;
    setFolders((prev) => [...prev, newFolder]);
    setActiveFolder(newFolder.id);
  };

  const handleRenameFolder = async (id: string, name: string) => {
    const result = await renameFolderAction(id, name);
    if (result.error) { toast.error(result.error); return; }
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
  };

  const handleRecolorFolder = async (id: string, color: FolderColor) => {
    const result = await recolorFolderAction(id, color);
    if (result.error) { toast.error(result.error); return; }
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, color } : f));
  };

  const handleDeleteFolder = async (id: string) => {
    const result = await deleteFolderAction(id);
    if (result.error) { toast.error(result.error); return; }
    setFolders((prev) => prev.filter((f) => f.id !== id));
    // Unassign projects that were in this folder
    setProjects((prev) => prev.map((p) => p.folderId === id ? { ...p, folderId: null } : p));
    if (activeFolder === id) setActiveFolder(null);
  };

  const handleMoveToFolder = async (projectId: string, folderId: string | null) => {
    const result = await moveProjectToFolderAction(projectId, folderId);
    if (result.error) { toast.error(result.error); return; }
    // Optimistic update
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, folderId } : p));
  };

  const handleSignOut = () => {
    startTransition(async () => { await signOutAction(); });
  };

  const displayName = (() => {
    const u = user as { profile?: { fullName?: string; name?: string }; email?: string };
    return (
      u?.profile?.fullName?.split(" ")[0] ||
      u?.profile?.name?.split(" ")[0] ||
      (u?.email as string | undefined)?.split("@")[0] ||
      "there"
    );
  })();

  return (
    <KeyboardShortcutsProvider projects={projects}>
      <DashboardContent
        displayName={displayName}
        projects={projects}
        folders={folders}
        loading={loading}
        search={search}
        setSearch={setSearch}
        debouncedSearch={debouncedSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        isPending={isPending}
        plan={plan}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onRecolorFolder={handleRecolorFolder}
        onDeleteFolder={handleDeleteFolder}
        onMoveToFolder={handleMoveToFolder}
        handleSignOut={handleSignOut}
        handleRename={handleRename}
        handleDelete={handleDelete}
        handleDuplicate={handleDuplicate}
        lastOpened={lastOpened}
        bannerDismissed={bannerDismissed}
        onDismissBanner={() => {
          setBannerDismissed(true);
          clearLastOpened("current_user");
        }}
        checklistState={checklistDismissed ? null : checklistState}
        onDismissChecklist={() => setChecklistDismissed(true)}
      />
    </KeyboardShortcutsProvider>
  );
}

// ── Dashboard Content Component ──────────────────────────────────────────────
type DashboardContentProps = {
  displayName: string;
  projects: DashboardProject[];
  folders: Folder[];
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  debouncedSearch: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isPending: boolean;
  plan: string;
  activeFolder: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (name: string, color: FolderColor) => void;
  onRenameFolder: (id: string, name: string) => void;
  onRecolorFolder: (id: string, color: FolderColor) => void;
  onDeleteFolder: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
  handleSignOut: () => void;
  handleRename: (projectId: string, newTitle: string) => Promise<boolean>;
  handleDelete: (projectId: string) => Promise<void>;
  handleDuplicate: (projectId: string) => Promise<void>;
  lastOpened: LastOpenedEntry | null;
  bannerDismissed: boolean;
  onDismissBanner: () => void;
  checklistState: OnboardingState | null;
  onDismissChecklist: () => void;
};

function DashboardContent({
  displayName,
  projects,
  folders,
  loading,
  search,
  setSearch,
  debouncedSearch,
  viewMode,
  setViewMode,
  searchOpen,
  setSearchOpen,
  isPending,
  plan,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onRecolorFolder,
  onDeleteFolder,
  onMoveToFolder,
  handleSignOut,
  handleRename,
  handleDelete,
  handleDuplicate,
  lastOpened,
  bannerDismissed,
  onDismissBanner,
  checklistState,
  onDismissChecklist,
}: DashboardContentProps) {
  const isPro = plan === "pro" || plan === "team";

  // ── Folder filtering ──────────────────────────────────────────────────────
  const filteredProjects = (() => {
    if (!activeFolder) return projects;
    if (activeFolder === "unfiled") return projects.filter((p) => !p.folderId);
    return projects.filter((p) => p.folderId === activeFolder);
  })();

  // Counts for sidebar
  const projectCounts: Record<string, number> = {};
  for (const f of folders) {
    projectCounts[f.id] = projects.filter((p) => p.folderId === f.id).length;
  }
  const unfiledCount = projects.filter((p) => !p.folderId).length;
  const hasFolders = folders.length > 0;

  // Resolve the last-opened project from the current project list
  const lastOpenedProject = lastOpened && !bannerDismissed
    ? projects.find((p) => p.slugId === lastOpened.slugId) ?? null
    : null;
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />

          {/* Mobile search expand */}
          <AnimatePresence initial={false}>
            {searchOpen && (
              <motion.div
                key="mobile-search"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 right-0 top-0 z-50 flex h-14 items-center gap-2 bg-background/95 backdrop-blur-xl px-4 sm:hidden"
              >
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearch(""); }}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile search icon */}
            <button
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>

            {/* Pro badge or Upgrade button */}
            {isPro ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="hidden sm:flex items-center gap-1.5"
              >
                <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Zap className="size-3 fill-primary" />
                  Pro
                </span>
                <ManageBillingButton />
              </motion.div>
            ) : (
              <UpgradeButton
                plan="pro"
                size="sm"
                className="hidden sm:flex h-8 text-xs px-3"
              >
                Upgrade
              </UpgradeButton>
            )}

            <DarkModeToggle />

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground px-2 sm:px-3"
              onClick={handleSignOut}
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className="size-3.5" />
              ) : (
                <LogOut className="size-3.5" />
              )}
              <span className="hidden sm:inline text-sm">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {/* ── Continue banner ── */}
        <AnimatePresence>
          {lastOpenedProject && (
            <ContinueBanner
              key={lastOpenedProject.id}
              project={lastOpenedProject}
              openedAt={lastOpened!.openedAt}
              onDismiss={onDismissBanner}
            />
          )}
        </AnimatePresence>

        {/* ── Onboarding checklist ── */}
        <AnimatePresence>
          {checklistState && (
            <OnboardingChecklist
              key="onboarding"
              state={checklistState}
              onDismiss={onDismissChecklist}
            />
          )}
        </AnimatePresence>

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Hey, {displayName} 👋
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            {projects.length > 0
              ? `${projects.length} project${projects.length !== 1 ? "s" : ""} in your workspace.`
              : "Start building something amazing."}
          </p>
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3"
        >
          {/* Desktop search */}
          <div className="relative hidden sm:flex flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Spacer on mobile */}
          <div className="flex-1 sm:hidden" />

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={cn(
                "rounded-md p-1.5 transition-all duration-150",
                viewMode === "grid"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={cn(
                "rounded-md p-1.5 transition-all duration-150",
                viewMode === "list"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="size-3.5" />
            </button>
          </div>

          {/* New project */}
          <Button size="sm" className="gap-1.5 shrink-0" asChild>
            <Link href="/new">
              <Plus className="size-4" />
              <span className="hidden xs:inline">New project</span>
              <span className="xs:hidden">New</span>
            </Link>
          </Button>
        </motion.div>

        {/* ── Active search pill (mobile) ── */}
        <AnimatePresence>
          {debouncedSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 overflow-hidden sm:hidden"
            >
              <div className="flex items-center gap-2 rounded-lg bg-primary/8 border border-primary/20 px-3 py-2">
                <Search className="size-3.5 text-primary shrink-0" />
                <span className="text-xs text-foreground flex-1 truncate">
                  Results for <strong>&quot;{debouncedSearch}&quot;</strong>
                </span>
                <button
                  onClick={() => { setSearch(""); setSearchOpen(false); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content ── */}
        {loading ? (
          <DashboardSkeleton viewMode={viewMode} />
        ) : (
          <div className={cn("flex gap-6", hasFolders && "items-start")}>
            {/* Folder sidebar — only shown when folders exist */}
            <AnimatePresence initial={false}>
              {hasFolders && (
                <motion.div
                  key="folder-sidebar"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 208 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="hidden lg:block shrink-0 overflow-hidden"
                >
                  <FolderSidebar
                    folders={folders}
                    activeFolder={activeFolder}
                    onSelectFolder={onSelectFolder}
                    onCreateFolder={onCreateFolder}
                    onRenameFolder={onRenameFolder}
                    onRecolorFolder={onRecolorFolder}
                    onDeleteFolder={onDeleteFolder}
                    projectCounts={projectCounts}
                    totalCount={projects.length}
                    unfiledCount={unfiledCount}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Project grid */}
            <div className="flex-1 min-w-0">
              {filteredProjects.length === 0 ? (
                <EmptyDashboard hasSearch={!!debouncedSearch} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
                      : "flex flex-col gap-2 sm:gap-3"
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, i) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        viewMode={viewMode}
                        index={i}
                        onRename={handleRename}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        folders={folders}
                        onMoveToFolder={onMoveToFolder}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ── Keyboard shortcut hint ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono text-[10px]">
            {getShortcutDisplay({ key: "K", metaKey: true })}
          </kbd>
          <span>to open command palette</span>
        </motion.div>
      </main>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function DashboardSkeleton({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
          : "flex flex-col gap-2 sm:gap-3"
      )}
    >
      {Array.from({ length: viewMode === "grid" ? 8 : 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className={cn(
            "rounded-xl border border-border bg-card overflow-hidden",
            viewMode === "list" && "flex items-center gap-3 sm:gap-4 p-3 sm:p-4"
          )}
        >
          {viewMode === "grid" ? (
            <>
              <Skeleton className="h-36 sm:h-44 w-full rounded-none" />
              <div className="p-3 sm:p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-10 w-14 sm:h-12 sm:w-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

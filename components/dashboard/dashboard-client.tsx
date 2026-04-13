"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "./project-card";
import EmptyDashboard from "./empty-dashboard";
import {
  renameProjectAction,
  deleteProjectAction,
  duplicateProjectAction,
} from "@/app/action/dashboard-actions";
import { signOutAction } from "@/app/auth/actions";
import {
  Plus, Search, LogOut, LayoutGrid, List,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardProject = {
  id: string;
  title: string;
  slugId: string;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  thumbnail: {
    id: string;
    name: string;
    rootStyles: string;
    htmlContent: string;
  } | null;
};

type ViewMode = "grid" | "list";

export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPending, startTransition] = useTransition();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

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

  useEffect(() => {
    fetchProjects(debouncedSearch);
  }, [debouncedSearch, fetchProjects]);

  const handleRename = async (projectId: string, newTitle: string) => {
    const result = await renameProjectAction(projectId, newTitle);
    if (result.error) { toast.error(result.error); return false; }
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, title: result.title! } : p)
    );
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

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  const displayName = user?.profile?.name || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
              disabled={isPending}
            >
              {isPending ? <Spinner className="size-3.5" /> : <LogOut className="size-3.5" />}
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Good to see you, {displayName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {projects.length > 0
              ? `You have ${projects.length} project${projects.length !== 1 ? "s" : ""}.`
              : "Start building something amazing."}
          </p>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 gap-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="size-3.5" />
              </button>
            </div>

            {/* New project */}
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/new">
                <Plus className="size-4" />
                New project
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <DashboardSkeleton viewMode={viewMode} />
        ) : projects.length === 0 ? (
          <EmptyDashboard hasSearch={!!debouncedSearch} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "flex flex-col gap-3"
            )}
          >
            <AnimatePresence mode="popLayout">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  index={i}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function DashboardSkeleton({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className={cn(
      viewMode === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        : "flex flex-col gap-3"
    )}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={cn(
          "rounded-xl border border-border bg-card overflow-hidden",
          viewMode === "list" && "flex items-center gap-4 p-4"
        )}>
          {viewMode === "grid" ? (
            <>
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-12 w-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

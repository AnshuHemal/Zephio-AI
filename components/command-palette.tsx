"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Plus,
  Search,
  Home,
  FileText,
  Settings,
  LogOut,
  Zap,
  Moon,
  Sun,
  Monitor,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOutAction } from "@/app/auth/actions";
import { useAuth } from "@/components/auth-context";
import { getShortcutDisplay } from "@/hooks/use-keyboard-shortcuts";
import { toast } from "sonner";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: Array<{
    id: string;
    title: string;
    slugId: string;
    pageCount: number;
  }>;
  onUpgradeClick?: () => void;
};

export default function CommandPalette({
  open,
  onOpenChange,
  projects = [],
  onUpgradeClick,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = useCallback(
    (callback: () => void) => {
      onOpenChange(false);
      // Small delay to allow dialog close animation
      setTimeout(callback, 100);
    },
    [onOpenChange]
  );

  // Close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }
  }, [open, onOpenChange]);

  if (!mounted) return null;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Quick actions and navigation"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <Search className="mx-auto size-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No results found.</p>
          </div>
        </CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/dashboard"))}
          >
            <Home className="mr-2" />
            <span>Dashboard</span>
            <CommandShortcut>G then D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/new"))}
          >
            <Plus className="mr-2" />
            <span>New Project</span>
            <CommandShortcut>{getShortcutDisplay({ key: "N", metaKey: true })}</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Projects">
              {projects.slice(0, 5).map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() =>
                    handleSelect(() => router.push(`/project/${project.slugId}`))
                  }
                >
                  <FileText className="mr-2" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="truncate">{project.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {project.pageCount} {project.pageCount === 1 ? "page" : "pages"}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Theme */}
        <CommandSeparator />
        <CommandGroup heading="Appearance">
          <CommandItem
            onSelect={() => handleSelect(() => setTheme("light"))}
            disabled={theme === "light"}
          >
            <Sun className="mr-2" />
            <span>Light Mode</span>
            {theme === "light" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <Sparkles className="size-3 text-primary" />
              </motion.div>
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => setTheme("dark"))}
            disabled={theme === "dark"}
          >
            <Moon className="mr-2" />
            <span>Dark Mode</span>
            {theme === "dark" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <Sparkles className="size-3 text-primary" />
              </motion.div>
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => setTheme("system"))}
            disabled={theme === "system"}
          >
            <Monitor className="mr-2" />
            <span>System</span>
            {theme === "system" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <Sparkles className="size-3 text-primary" />
              </motion.div>
            )}
          </CommandItem>
        </CommandGroup>

        {/* Actions */}
        {isSignedIn && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              {onUpgradeClick && (
                <CommandItem onSelect={() => handleSelect(onUpgradeClick)}>
                  <Zap className="mr-2 text-primary" />
                  <span>Upgrade to Pro</span>
                </CommandItem>
              )}
              <CommandItem
                onSelect={() =>
                  handleSelect(async () => {
                    await signOutAction();
                    toast.success("Signed out successfully");
                  })
                }
              >
                <LogOut className="mr-2" />
                <span>Sign Out</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

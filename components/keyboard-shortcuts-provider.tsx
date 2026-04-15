"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import CommandPalette from "./command-palette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

type KeyboardShortcutsContextType = {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  registerEscapeHandler: (handler: () => void) => () => void;
  registerSubmitHandler: (handler: () => void) => () => void;
};

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error("useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider");
  }
  return context;
}

type Props = {
  children: React.ReactNode;
  projects?: Array<{
    id: string;
    title: string;
    slugId: string;
    pageCount: number;
  }>;
  onUpgradeClick?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
};

export default function KeyboardShortcutsProvider({ children, projects, onUpgradeClick, onUndo, onRedo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [escapeHandlers, setEscapeHandlers] = useState<Set<() => void>>(new Set());
  const [submitHandlers, setSubmitHandlers] = useState<Set<() => void>>(new Set());

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const registerEscapeHandler = useCallback((handler: () => void) => {
    setEscapeHandlers((prev) => new Set(prev).add(handler));
    return () => {
      setEscapeHandlers((prev) => {
        const next = new Set(prev);
        next.delete(handler);
        return next;
      });
    };
  }, []);

  const registerSubmitHandler = useCallback((handler: () => void) => {
    setSubmitHandlers((prev) => new Set(prev).add(handler));
    return () => {
      setSubmitHandlers((prev) => {
        const next = new Set(prev);
        next.delete(handler);
        return next;
      });
    };
  }, []);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    // Cmd+K - Open command palette
    {
      key: "k",
      metaKey: true,
      handler: (e) => {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
        const isChatInput = target.closest('[data-slot="prompt-input"]');
        if (!isInput || isChatInput) setCommandPaletteOpen(true);
      },
    },
    // Cmd+N - New project
    {
      key: "n",
      metaKey: true,
      handler: () => {
        router.push("/new");
      },
    },
    // Cmd+Z - Undo
    {
      key: "z",
      metaKey: true,
      shiftKey: false,
      handler: () => {
        onUndo?.();
      },
    },
    // Cmd+Shift+Z - Redo
    {
      key: "z",
      metaKey: true,
      shiftKey: true,
      handler: () => {
        onRedo?.();
      },
    },
    // Ctrl+Y - Redo (Windows alternative)
    {
      key: "y",
      metaKey: true,
      handler: () => {
        onRedo?.();
      },
    },
    // Escape - Close modals / deselect
    {
      key: "Escape",
      handler: (e) => {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        const handlers = Array.from(escapeHandlers);
        if (handlers.length > 0) handlers[handlers.length - 1]();
      },
      preventDefault: false,
    },
    // Cmd+Enter - Submit
    {
      key: "Enter",
      metaKey: true,
      handler: () => {
        const handlers = Array.from(submitHandlers);
        if (handlers.length > 0) handlers[handlers.length - 1]();
      },
    },
  ]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        openCommandPalette,
        closeCommandPalette,
        registerEscapeHandler,
        registerSubmitHandler,
      }}
    >
      {children}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        projects={projects}
        onUpgradeClick={onUpgradeClick}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

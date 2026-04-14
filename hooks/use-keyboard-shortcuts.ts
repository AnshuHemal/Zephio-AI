"use client";

import { useEffect, useCallback } from "react";

type ShortcutHandler = (e: KeyboardEvent) => void;

interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: ShortcutHandler;
  preventDefault?: boolean;
}

/**
 * Hook for registering keyboard shortcuts
 * Automatically handles Mac (Cmd) vs Windows/Linux (Ctrl) differences
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");

      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        
        // Handle meta/ctrl key (Cmd on Mac, Ctrl on Windows/Linux)
        const modifierKey = isMac ? e.metaKey : e.ctrlKey;
        const modifierMatches = shortcut.metaKey ? modifierKey : !modifierKey;
        
        const shiftMatches = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatches = shortcut.altKey ? e.altKey : !e.altKey;

        if (keyMatches && modifierMatches && shiftMatches && altMatches) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Get the display string for a keyboard shortcut
 * Returns platform-appropriate modifier keys (⌘ on Mac, Ctrl on Windows/Linux)
 */
export function getShortcutDisplay(shortcut: {
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");
  const parts: string[] = [];

  if (shortcut.metaKey) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? "⇧" : "Shift");
  }
  if (shortcut.altKey) {
    parts.push(isMac ? "⌥" : "Alt");
  }

  // Capitalize single letters, keep special keys as-is
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);

  return parts.join(isMac ? "" : "+");
}

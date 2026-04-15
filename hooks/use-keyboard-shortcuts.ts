"use client";

import { useEffect, useRef } from "react";

type ShortcutHandler = (e: KeyboardEvent) => void;

export interface KeyboardShortcut {
  key: string;
  /** Requires Cmd (Mac) or Ctrl (Win/Linux) */
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: ShortcutHandler;
  /** Set false to skip e.preventDefault(). Defaults to true when metaKey is set. */
  preventDefault?: boolean;
}

/**
 * Registers keyboard shortcuts with stable event listener attachment.
 * Uses a ref for the shortcuts array so the listener is never re-attached
 * on re-renders — only the handler logic updates.
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts);

  // Update the ref inside an effect to satisfy React's rules
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().includes("MAC");

      for (const shortcut of shortcutsRef.current) {
        const keyMatches =
          e.key.toLowerCase() === shortcut.key.toLowerCase();

        // Cmd on Mac, Ctrl on Win/Linux
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        // Only check modifier if the shortcut declares it
        const metaMatches =
          shortcut.metaKey === undefined
            ? true                    // shortcut doesn't care about Cmd/Ctrl
            : shortcut.metaKey
            ? modKey                  // shortcut requires Cmd/Ctrl
            : !modKey;                // shortcut requires NO Cmd/Ctrl

        const shiftMatches =
          shortcut.shiftKey === undefined
            ? true
            : shortcut.shiftKey
            ? e.shiftKey
            : !e.shiftKey;

        const altMatches =
          shortcut.altKey === undefined
            ? true
            : shortcut.altKey
            ? e.altKey
            : !e.altKey;

        if (keyMatches && metaMatches && shiftMatches && altMatches) {
          // Default: preventDefault when a modifier key is involved
          const shouldPrevent =
            shortcut.preventDefault !== false &&
            (shortcut.metaKey || shortcut.shiftKey || shortcut.altKey);
          if (shouldPrevent) e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // ← empty deps: listener attached once, shortcutsRef always current
}

/**
 * Returns the platform-appropriate display string for a shortcut.
 * e.g. { key: "Z", metaKey: true, shiftKey: true } → "⌘⇧Z" on Mac, "Ctrl+Shift+Z" on Win
 */
export function getShortcutDisplay(shortcut: {
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}): string {
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().includes("MAC");

  const parts: string[] = [];
  if (shortcut.metaKey) parts.push(isMac ? "⌘" : "Ctrl");
  if (shortcut.shiftKey) parts.push(isMac ? "⇧" : "Shift");
  if (shortcut.altKey)   parts.push(isMac ? "⌥" : "Alt");

  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);

  return parts.join(isMac ? "" : "+");
}

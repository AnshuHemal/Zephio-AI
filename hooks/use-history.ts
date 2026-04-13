import { useCallback, useRef, useState } from "react";
import { PageType } from "@/types/project";

const MAX_HISTORY = 20;

export type HistorySnapshot = {
  pages: PageType[];
  timestamp: number;
};

export function useHistory(initialPages: PageType[] = []) {
  // past[0] is oldest, past[last] is most recent undo-able state
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);

  // We track the "current" pages externally (in ChatInterface),
  // so we only store snapshots here.
  const isUndoRedoRef = useRef(false);

  /**
   * Call this BEFORE mutating pages to save the current state.
   */
  const pushSnapshot = useCallback((currentPages: PageType[]) => {
    if (isUndoRedoRef.current) return; // don't snapshot during undo/redo
    setPast((prev) => {
      const next = [
        ...prev,
        { pages: currentPages.map((p) => ({ ...p })), timestamp: Date.now() },
      ];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
    setFuture([]); // clear redo stack on new action
  }, []);

  /**
   * Undo: returns the previous snapshot's pages, or null if nothing to undo.
   */
  const undo = useCallback(
    (currentPages: PageType[]): PageType[] | null => {
      if (past.length === 0) return null;
      isUndoRedoRef.current = true;

      const previous = past[past.length - 1];
      setPast((prev) => prev.slice(0, -1));
      setFuture((prev) => [
        { pages: currentPages.map((p) => ({ ...p })), timestamp: Date.now() },
        ...prev,
      ]);

      setTimeout(() => { isUndoRedoRef.current = false; }, 0);
      return previous.pages;
    },
    [past]
  );

  /**
   * Redo: returns the next snapshot's pages, or null if nothing to redo.
   */
  const redo = useCallback(
    (currentPages: PageType[]): PageType[] | null => {
      if (future.length === 0) return null;
      isUndoRedoRef.current = true;

      const next = future[0];
      setFuture((prev) => prev.slice(1));
      setPast((prev) => [
        ...prev,
        { pages: currentPages.map((p) => ({ ...p })), timestamp: Date.now() },
      ]);

      setTimeout(() => { isUndoRedoRef.current = false; }, 0);
      return next.pages;
    },
    [future]
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return { pushSnapshot, undo, redo, canUndo, canRedo };
}

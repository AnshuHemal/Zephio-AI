/**
 * useCanvasViewport
 *
 * Tracks which page indices are within the visible canvas viewport,
 * accounting for the current pan position and zoom scale from
 * react-zoom-pan-pinch.
 *
 * Strategy:
 *  - Pages are laid out horizontally: page[i].x = PAGE_OFFSET_X + i * PAGE_STRIDE
 *  - We compute the world-space rectangle that is currently visible in the
 *    browser viewport, then check which pages overlap it.
 *  - A BUFFER of extra pages is added on each side so iframes don't flicker
 *    during fast panning.
 *  - The selected page is always considered visible regardless of position.
 */

import { useCallback, useRef, useState } from "react";

// Must match the values used in canvas/index.tsx
export const PAGE_WIDTH   = 1550;  // default page width
export const PAGE_STRIDE  = 1600;  // horizontal gap between page origins
export const PAGE_OFFSET_X = 100;  // x of first page
export const PAGE_OFFSET_Y = 100;  // y of all pages

/** How many extra pages to keep rendered beyond each visible edge */
const BUFFER = 1;

export type TransformState = {
  scale: number;
  positionX: number;
  positionY: number;
};

export type CanvasViewportResult = {
  /** Set of page indices that should have their iframe rendered */
  visibleIndices: Set<number>;
  /** Call this whenever the TransformWrapper fires onTransformed */
  onTransformed: (state: TransformState, pageCount: number, selectedIndex: number) => void;
};

export function useCanvasViewport(
  containerRef: React.RefObject<HTMLDivElement | null>
): CanvasViewportResult {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(
    // Start with first 2 pages visible so initial render is instant
    new Set([0, 1])
  );

  // Debounce updates during fast panning to avoid thrashing
  const rafRef = useRef<number | null>(null);

  const onTransformed = useCallback(
    (state: TransformState, pageCount: number, selectedIndex: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const container = containerRef.current;
        if (!container || pageCount === 0) return;

        const { scale, positionX, positionY } = state;
        const { clientWidth, clientHeight } = container;

        // Viewport in world-space coordinates
        // world_x = (screen_x - positionX) / scale
        const worldLeft   = (0 - positionX) / scale;
        const worldRight  = (clientWidth - positionX) / scale;

        const newVisible = new Set<number>();

        for (let i = 0; i < pageCount; i++) {
          const pageLeft  = PAGE_OFFSET_X + i * PAGE_STRIDE;
          const pageRight = pageLeft + PAGE_WIDTH;

          // Check horizontal overlap with buffer
          const bufferedLeft  = worldLeft  - BUFFER * PAGE_STRIDE;
          const bufferedRight = worldRight + BUFFER * PAGE_STRIDE;

          if (pageRight >= bufferedLeft && pageLeft <= bufferedRight) {
            newVisible.add(i);
          }
        }

        // Always keep selected page rendered
        if (selectedIndex >= 0 && selectedIndex < pageCount) {
          newVisible.add(selectedIndex);
        }

        // Only trigger re-render if the set actually changed
        setVisibleIndices((prev) => {
          if (prev.size === newVisible.size) {
            let same = true;
            for (const idx of newVisible) {
              if (!prev.has(idx)) { same = false; break; }
            }
            if (same) return prev;
          }
          return newVisible;
        });
      });
    },
    [containerRef]
  );

  return { visibleIndices, onTransformed };
}

export type PageComment = {
  id: string;
  pageId: string;
  slugId: string;
  authorName: string;
  text: string;
  /** Horizontal position as percentage of the page width (0–100) */
  xPct: number;
  /** Vertical position as percentage of the page scroll height (0–100) */
  yPct: number;
  resolved: boolean;
  createdAt: string;
};

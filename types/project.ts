export type PageType = {
  id: string;
  name: string;
  rootStyles: string;
  htmlContent: string;
  isLoading: boolean;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PageVersion = {
  id: string;
  pageId: string;
  htmlContent: string;
  rootStyles: string;
  versionNumber: number;
  createdAt: string;
  /** Snapshot of the page name at the time this version was saved */
  label?: string;
};

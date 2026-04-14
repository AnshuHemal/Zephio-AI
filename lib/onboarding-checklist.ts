/**
 * Onboarding Checklist — client-side localStorage tracking.
 *
 * Tracks 4 key milestones for new users. Each step is completed once
 * and never resets. The checklist auto-hides when all steps are done.
 *
 * Key: "zephio_onboarding"
 * Value: OnboardingState
 */

export type ChecklistStepId =
  | "create_project"
  | "generate_page"
  | "export_design"
  | "share_preview";

export type ChecklistStep = {
  id: ChecklistStepId;
  label: string;
  description: string;
  emoji: string;
};

export const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    id: "create_project",
    label: "Create your first project",
    description: "Start a new project from the dashboard",
    emoji: "🚀",
  },
  {
    id: "generate_page",
    label: "Generate your first page",
    description: "Describe your vision and watch it come to life",
    emoji: "✨",
  },
  {
    id: "export_design",
    label: "Export your design",
    description: "Download your pages as HTML files",
    emoji: "📦",
  },
  {
    id: "share_preview",
    label: "Share a preview link",
    description: "Copy a link to share your design with anyone",
    emoji: "🔗",
  },
];

export type OnboardingState = {
  completed: Record<ChecklistStepId, boolean>;
  dismissed: boolean;
  /** ISO timestamp of first visit */
  startedAt: string;
};

const STORAGE_KEY = "zephio_onboarding";

function defaultState(): OnboardingState {
  return {
    completed: {
      create_project: false,
      generate_page: false,
      export_design: false,
      share_preview: false,
    },
    dismissed: false,
    startedAt: new Date().toISOString(),
  };
}

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    // Merge with defaults to handle missing keys from older versions
    return { ...defaultState(), ...parsed, completed: { ...defaultState().completed, ...parsed.completed } };
  } catch {
    return defaultState();
  }
}

export function completeStep(stepId: ChecklistStepId): void {
  if (typeof window === "undefined") return;
  try {
    const state = getOnboardingState();
    if (state.completed[stepId]) return; // already done
    state.completed[stepId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function dismissChecklist(): void {
  if (typeof window === "undefined") return;
  try {
    const state = getOnboardingState();
    state.dismissed = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function isChecklistComplete(state: OnboardingState): boolean {
  return Object.values(state.completed).every(Boolean);
}

export function completedCount(state: OnboardingState): number {
  return Object.values(state.completed).filter(Boolean).length;
}

const TOUR_KEY = "zephio_tour_completed";
const FIRST_VISIT_KEY = "zephio_first_visit";

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_KEY) === "true";
}

export function markTourCompleted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOUR_KEY, "true");
}

export function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  const visited = localStorage.getItem(FIRST_VISIT_KEY);
  if (!visited) {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
    return true;
  }
  return false;
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_KEY);
  localStorage.removeItem(FIRST_VISIT_KEY);
}

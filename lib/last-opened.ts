/**
 * Last-opened project tracking — client-side only.
 *
 * Stores the most recently opened project per user in localStorage so the
 * dashboard can surface a "Continue where you left off" affordance.
 *
 * Key: "zephio_last_opened_{userId}"
 * Value: { slugId, title, openedAt }
 */

export type LastOpenedEntry = {
  slugId: string;
  title: string;
  openedAt: string; // ISO string
};

function storageKey(userId: string) {
  return `zephio_last_opened_${userId}`;
}

export function setLastOpened(userId: string, entry: Omit<LastOpenedEntry, "openedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const value: LastOpenedEntry = { ...entry, openedAt: new Date().toISOString() };
    localStorage.setItem(storageKey(userId), JSON.stringify(value));
  } catch { /* storage full or unavailable */ }
}

export function getLastOpened(userId: string): LastOpenedEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as LastOpenedEntry) : null;
  } catch {
    return null;
  }
}

export function clearLastOpened(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(userId));
  } catch { /* ignore */ }
}

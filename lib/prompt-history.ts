/**
 * Prompt History — client-side localStorage storage.
 *
 * Stores the last MAX_HISTORY prompts the user has submitted.
 * Prompts are deduped (most recent wins) and capped at MAX_HISTORY.
 *
 * Key: "zephio_prompt_history"
 * Value: string[] (most recent first)
 */

const STORAGE_KEY = "zephio_prompt_history";
const MAX_HISTORY = 10;
const MIN_LENGTH = 10; // ignore very short prompts like "hi"

export function getPromptHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addToPromptHistory(prompt: string): void {
  if (typeof window === "undefined") return;
  const trimmed = prompt.trim();
  if (trimmed.length < MIN_LENGTH) return; // skip trivially short prompts

  try {
    const history = getPromptHistory();
    // Remove duplicate if it already exists (case-insensitive)
    const deduped = history.filter(
      (p) => p.toLowerCase() !== trimmed.toLowerCase()
    );
    // Prepend the new prompt and cap at MAX_HISTORY
    const updated = [trimmed, ...deduped].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* storage full */ }
}

export function removeFromPromptHistory(prompt: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getPromptHistory();
    const updated = history.filter((p) => p !== prompt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export function clearPromptHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

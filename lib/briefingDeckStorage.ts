/**
 * Briefing deck payload for /briefing/deck must survive opening a new tab.
 * sessionStorage is per-tab only, so cross-tab handoff uses localStorage.
 */

export const BRIEFING_DECK_STORAGE_KEY = "fl_briefing_deck";

export function persistBriefingDeckForViewer(payload: unknown): void {
  const raw = JSON.stringify(payload);
  try {
    localStorage.setItem(BRIEFING_DECK_STORAGE_KEY, raw);
  } catch {
    try {
      sessionStorage.setItem(BRIEFING_DECK_STORAGE_KEY, raw);
    } catch {
      throw new Error("Could not store deck (storage blocked or full).");
    }
  }
}

/** Prefer localStorage (set before opening a new tab); fall back to sessionStorage (same-tab navigation). */
export function readBriefingDeckRaw(): string | null {
  try {
    const fromLocal = localStorage.getItem(BRIEFING_DECK_STORAGE_KEY);
    if (fromLocal) return fromLocal;
    return sessionStorage.getItem(BRIEFING_DECK_STORAGE_KEY);
  } catch {
    return null;
  }
}

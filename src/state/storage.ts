const KEY = "mohm-hunt-v1";

export interface PersistedState {
  age?: number;
  ageTier?: string;
  restoredSections: string[]; // section ids
  completedQuestions: string[]; // `${sectionId}:${questionId}`
}

interface LegacyState {
  earnedPatches?: string[];
}

const DEFAULT: PersistedState = {
  restoredSections: [],
  completedQuestions: [],
};

export function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as PersistedState & LegacyState;
    return {
      ...DEFAULT,
      ...parsed,
      // Migrate pre-rebrand saves: earnedPatches -> restoredSections.
      restoredSections: parsed.restoredSections ?? parsed.earnedPatches ?? [],
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function savePersisted(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // quota or privacy mode — state will reset on reload
  }
}

export function resetPersisted(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}

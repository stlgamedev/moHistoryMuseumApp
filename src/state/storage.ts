const KEY = "mohm-hunt-v1";

export interface PersistedState {
  age?: number;
  ageTier?: string;
  earnedPatches: string[]; // section ids
  completedQuestions: string[]; // `${sectionId}:${questionId}`
}

const DEFAULT: PersistedState = {
  earnedPatches: [],
  completedQuestions: [],
};

export function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as PersistedState;
    return { ...DEFAULT, ...parsed };
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

import { signal, computed, effect } from "@preact/signals";
import type { Section } from "../content/types";
import { AGE_TIERS, AGE_TIER_RANGES, type AgeTier } from "../content/types";
import { loadPersisted, savePersisted, resetPersisted, type PersistedState } from "./storage";

function validTier(value: string | undefined): AgeTier | undefined {
  return value && (AGE_TIERS as string[]).includes(value) ? (value as AgeTier) : undefined;
}

export type Screen =
  | { kind: "welcome" }
  | { kind: "about" }
  | { kind: "credits" }
  | { kind: "instructions" }
  | { kind: "age-select" }
  | { kind: "section-select" }
  | { kind: "question"; sectionId: string; questionIndex: number }
  | { kind: "hint"; sectionId: string; questionIndex: number }
  | { kind: "patch-earned"; sectionId: string }
  | { kind: "inventory" };

const persisted = loadPersisted();

export const screen = signal<Screen>({ kind: "welcome" });
export const age = signal<number | undefined>(persisted.age);
export const ageTier = signal<AgeTier | undefined>(validTier(persisted.ageTier));
export const earnedPatches = signal<Set<string>>(new Set(persisted.earnedPatches));
export const completedQuestions = signal<Set<string>>(new Set(persisted.completedQuestions));
export const sections = signal<Section[]>([]);

export const activeSection = computed<Section | undefined>(() => {
  const s = screen.value;
  if (s.kind !== "question" && s.kind !== "hint" && s.kind !== "patch-earned") return undefined;
  return sections.value.find((x) => x.id === s.sectionId);
});

// Persist on every relevant change.
effect(() => {
  const state: PersistedState = {
    age: age.value,
    ageTier: ageTier.value,
    earnedPatches: [...earnedPatches.value],
    completedQuestions: [...completedQuestions.value],
  };
  savePersisted(state);
});

export function go(next: Screen): void {
  screen.value = next;
}

export function setAge(years: number): void {
  age.value = years;
  ageTier.value = tierFor(years);
}

function tierFor(years: number): AgeTier {
  if (years <= 12) return "youth";
  if (years <= 17) return "teen";
  return "adult";
}

export function selectAgeTier(tier: AgeTier): void {
  ageTier.value = tier;
  if (age.value === undefined) {
    age.value = AGE_TIER_RANGES[tier].min;
  }
}

export function awardPatch(sectionId: string): void {
  const next = new Set(earnedPatches.value);
  next.add(sectionId);
  earnedPatches.value = next;
}

export function markComplete(sectionId: string, questionId: string): void {
  const key = `${sectionId}:${questionId}`;
  const next = new Set(completedQuestions.value);
  next.add(key);
  completedQuestions.value = next;
}

export function resetAll(): void {
  resetPersisted();
  age.value = undefined;
  ageTier.value = undefined;
  earnedPatches.value = new Set();
  completedQuestions.value = new Set();
  screen.value = { kind: "welcome" };
}

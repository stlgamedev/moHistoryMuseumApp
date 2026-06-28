// Maps each section to the flag cover layer(s) it removes when completed.
// All 7 covers are assigned across the 5 sections so a fully-completed game
// reveals the whole flag. Grouping is provisional — verify visually in Task 6
// and swap cover ids between sections if the reveal order looks unbalanced.
const BASE = import.meta.env.BASE_URL;

export const SECTION_COVERS: Record<string, string[]> = {
  "worlds-fair": ["cover-topright"],
  "marvel-in-motion": ["cover-botright"],
  "forest-park-150": ["cover-left", "cover-topleft"],
  "collected": ["cover-botleft", "cover-river"],
  "made-in-stl": ["cover-disc"],
};

export const FLAG_COVERS: string[] = Object.values(SECTION_COVERS).flat();

export function coversForSection(sectionId: string): string[] {
  return SECTION_COVERS[sectionId] ?? [];
}

export const FLAG_BASE_SRC = `${BASE}flag/flag-base.png`;

export function coverSrc(coverId: string): string {
  return `${BASE}flag/${coverId}.png`;
}

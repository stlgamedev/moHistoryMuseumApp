// Maps each section to the flag cover layer(s) it removes when completed.
// There are 7 cover layers and 7 sections, so this is a clean 1:1 map — each
// section restores exactly one region, and a fully-completed game reveals the
// whole flag. (If an STLGameDev section is later added for the center disc,
// re-shuffle these assignments.)
const BASE = import.meta.env.BASE_URL;

export const SECTION_COVERS: Record<string, string[]> = {
  "worlds-fair": ["cover-topright"],
  "marvel-in-motion": ["cover-botright"],
  "forest-park-150": ["cover-left"],
  "collected": ["cover-botleft"],
  "made-in-stl": ["cover-disc"],
  "route-66": ["cover-topleft"],
  "st-louis-sound": ["cover-river"],
};

export const FLAG_COVERS: string[] = Object.values(SECTION_COVERS).flat();

export function coversForSection(sectionId: string): string[] {
  return SECTION_COVERS[sectionId] ?? [];
}

export const FLAG_BASE_SRC = `${BASE}flag/flag-base.png`;

export function coverSrc(coverId: string): string {
  return `${BASE}flag/${coverId}.png`;
}

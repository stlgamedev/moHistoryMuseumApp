// Maps each section to the flag cover layer(s) it removes when completed.
// 8 sections, 8 cover layers — a clean 1:1 map, each section restores exactly
// one region, and a fully-completed game reveals the whole flag. The center
// disc is split into its gold ring (Made in St. Louis) and the fleur-de-lis
// emblem (STLGameDev, the centerpiece finale).
const BASE = import.meta.env.BASE_URL;

export const SECTION_COVERS: Record<string, string[]> = {
  "worlds-fair": ["cover-topright"],
  "marvel-in-motion": ["cover-botright"],
  "forest-park-150": ["cover-left"],
  "collected": ["cover-botleft"],
  "made-in-stl": ["cover-disc-ring"],
  "route-66": ["cover-topleft"],
  "st-louis-sound": ["cover-river"],
  "stlgamedev": ["cover-fleur"],
};

export const FLAG_COVERS: string[] = Object.values(SECTION_COVERS).flat();

export function coversForSection(sectionId: string): string[] {
  return SECTION_COVERS[sectionId] ?? [];
}

export const FLAG_BASE_SRC = `${BASE}flag/flag-base.png`;

export function coverSrc(coverId: string): string {
  return `${BASE}flag/${coverId}.png`;
}

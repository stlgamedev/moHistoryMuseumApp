import type { Section, SectionIndex } from "./types";

const CONTENT_ROOT = `${import.meta.env.BASE_URL}content`;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as T;
}

export async function loadSectionIndex(): Promise<SectionIndex> {
  return fetchJson<SectionIndex>(`${CONTENT_ROOT}/sections.json`);
}

export async function loadSection(id: string, relPath: string): Promise<Section> {
  const section = await fetchJson<Section>(`${CONTENT_ROOT}/${relPath}`);
  if (section.id !== id) {
    console.warn(`Section id mismatch: index=${id}, file=${section.id}`);
  }
  return resolveAssetPaths(section, relPath);
}

// Rewrite relative image paths in a section to absolute URLs under CONTENT_ROOT.
function resolveAssetPaths(section: Section, relPath: string): Section {
  const dir = relPath.includes("/") ? relPath.slice(0, relPath.lastIndexOf("/")) : "";
  const resolve = (p?: string): string | undefined => {
    if (!p) return p;
    if (/^(https?:)?\/\//.test(p) || p.startsWith("/")) return p;
    return `${CONTENT_ROOT}/${dir}/${p}`;
  };

  return {
    ...section,
    patchImage: resolve(section.patchImage) ?? section.patchImage,
    questions: section.questions.map((q) => ({
      ...q,
      hintImage: resolve(q.hintImage),
      variants: q.variants.map((v) => {
        if (v.type === "multi-image" || v.type === "multi-text") {
          return {
            ...v,
            choices: v.choices.map((c) => ({ ...c, image: resolve(c.image) })),
          };
        }
        return v;
      }),
    })),
  };
}

import { FLAG_COVERS, FLAG_BASE_SRC, coverSrc, coversForSection } from "../content/flag";

interface Props {
  restored: Set<string>; // restored section ids
  class?: string;
}

// Builds the set of cover ids that should still be visible (i.e. their
// section is NOT yet restored). Covers fade to 0 opacity via CSS when removed.
function hiddenCovers(restored: Set<string>): Set<string> {
  const gone = new Set<string>();
  for (const sectionId of restored) {
    for (const cover of coversForSection(sectionId)) gone.add(cover);
  }
  return gone;
}

export function RestorableFlag({ restored, class: extra = "" }: Props) {
  const gone = hiddenCovers(restored);
  return (
    <div class={`flag ${extra}`}>
      <img class="flag__base" src={FLAG_BASE_SRC} alt="St. Louis flag" />
      {FLAG_COVERS.map((cover) => (
        <img
          key={cover}
          class="flag__cover"
          src={coverSrc(cover)}
          alt=""
          aria-hidden="true"
          style={{ opacity: gone.has(cover) ? 0 : 1 }}
        />
      ))}
    </div>
  );
}

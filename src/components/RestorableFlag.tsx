import { useEffect, useState } from "preact/hooks";
import { FLAG_COVERS, FLAG_BASE_SRC, coverSrc, coversForSection } from "../content/flag";

interface Props {
  restored: Set<string>; // restored section ids
  reveal?: string;       // section id whose covers fade away on mount (the reveal animation)
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

export function RestorableFlag({ restored, reveal, class: extra = "" }: Props) {
  const gone = hiddenCovers(restored);
  // When `reveal` is set, that section's covers render visible on first paint,
  // then drop to opacity 0 in a post-mount frame so the CSS transition fires
  // (otherwise the cover mounts already-hidden and the fade never animates).
  const [animating, setAnimating] = useState<boolean>(!!reveal);
  useEffect(() => {
    if (!reveal) return;
    let inner = 0;
    // Double rAF: let the browser paint opacity:1 before flipping to 0.
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimating(false));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [reveal]);

  const revealCovers = reveal ? new Set(coversForSection(reveal)) : new Set<string>();

  return (
    <div class={`flag ${extra}`}>
      <img class="flag__base" src={FLAG_BASE_SRC} alt="St. Louis flag" />
      {FLAG_COVERS.map((cover) => {
        // A restored section's covers are hidden — except the reveal section's,
        // which stay visible for the initial frame so they can animate out.
        const hidden = gone.has(cover) && !(animating && revealCovers.has(cover));
        return (
          <img
            key={cover}
            class="flag__cover"
            src={coverSrc(cover)}
            alt=""
            aria-hidden="true"
            style={{ opacity: hidden ? 0 : 1 }}
          />
        );
      })}
    </div>
  );
}

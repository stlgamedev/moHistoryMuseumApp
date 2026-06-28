import { sections, restoredSections, go } from "../state/game";
import { RestorableFlag } from "../components/RestorableFlag";

interface Props {
  sectionId: string;
}

export function SectionRestored({ sectionId }: Props) {
  const restored = restoredSections.value;
  const count = restored.size;
  const total = sections.value.length;
  const allDone = count >= total && total > 0;

  return (
    <main class="screen screen--center">
      <h2>{allDone ? "You restored the whole flag!" : `You've restored ${count} section${count === 1 ? "" : "s"}!`}</h2>
      <RestorableFlag restored={restored} reveal={sectionId} />
      <div class="stack stack--wide">
        <button class="btn btn--primary btn--big" onClick={() => go({ kind: "flag" })}>
          View Flag
        </button>
        <button class="btn btn--big" onClick={() => go({ kind: "section-select" })}>
          Pick Another Section
        </button>
      </div>
    </main>
  );
}

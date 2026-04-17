import { sections, go } from "../state/game";

interface Props {
  sectionId: string;
}

export function PatchEarned({ sectionId }: Props) {
  const section = sections.value.find((s) => s.id === sectionId);
  return (
    <main class="screen screen--center">
      <h2>Excellent work!</h2>
      <p>
        You have earned the <strong>{section?.patchName ?? section?.name}</strong> patch.
      </p>
      {section?.patchImage && (
        <img class="patch-image patch-image--earned" src={section.patchImage} alt={`${section.name} patch`} />
      )}
      <div class="stack">
        <button class="btn btn--primary btn--big" onClick={() => go({ kind: "inventory" })}>
          View Inventory
        </button>
        <button class="btn btn--big" onClick={() => go({ kind: "section-select" })}>
          Pick Another Section
        </button>
      </div>
    </main>
  );
}

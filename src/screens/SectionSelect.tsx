import { go, sections, earnedPatches, ageTier } from "../state/game";

export function SectionSelect() {
  const list = sections.value;

  if (!ageTier.value) {
    return (
      <main class="screen">
        <h2>Pick an age first</h2>
        <button class="btn btn--primary" onClick={() => go({ kind: "age-select" })}>Go</button>
      </main>
    );
  }

  return (
    <main class="screen">
      <h2>Pick a section</h2>
      {list.length === 0 ? (
        <p>Loading sections…</p>
      ) : (
        <div class="stack">
          {list.map((sec) => {
            const earned = earnedPatches.value.has(sec.id);
            return (
              <button
                key={sec.id}
                class="btn btn--tile btn--big"
                onClick={() => go({ kind: "question", sectionId: sec.id, questionIndex: 0 })}
              >
                <span>{sec.name}</span>
                {earned && <span class="badge">★ Patch earned</span>}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}

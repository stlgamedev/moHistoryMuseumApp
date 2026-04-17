import { sections, earnedPatches, go } from "../state/game";

export function Inventory() {
  const all = sections.value;
  const earned = earnedPatches.value;

  return (
    <main class="screen">
      <h2>Patches</h2>
      {all.length === 0 ? (
        <p>No sections loaded.</p>
      ) : (
        <div class="patches-grid">
          {all.map((s) => {
            const gotIt = earned.has(s.id);
            return (
              <div key={s.id} class={`patch-slot ${gotIt ? "" : "patch-slot--locked"}`}>
                {s.patchImage ? (
                  <img src={s.patchImage} alt={s.patchName ?? s.name} />
                ) : (
                  <div class="patch-placeholder">{s.name}</div>
                )}
                <span class="patch-label">{gotIt ? (s.patchName ?? s.name) : "Locked"}</span>
              </div>
            );
          })}
        </div>
      )}
      <button class="btn btn--primary btn--big" onClick={() => go({ kind: "section-select" })}>
        Back to Sections
      </button>
    </main>
  );
}

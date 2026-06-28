import { sections, restoredSections, go } from "../state/game";
import { RestorableFlag } from "../components/RestorableFlag";

export function Flag() {
  const all = sections.value;
  const restored = restoredSections.value;

  return (
    <main class="screen screen--center">
      <h2>Your Flag</h2>
      <p class="flag-progress">{restored.size} of {all.length} sections restored</p>
      <RestorableFlag restored={restored} />
      <div class="flag-legend">
        {all.map((s) => (
          <div key={s.id} class={`flag-legend__row ${restored.has(s.id) ? "is-done" : ""}`}>
            <span class="flag-legend__mark">{restored.has(s.id) ? "★" : "○"}</span>
            <span>{s.name}</span>
          </div>
        ))}
      </div>
      <button class="btn btn--primary btn--big" onClick={() => go({ kind: "section-select" })}>
        Back to Sections
      </button>
    </main>
  );
}

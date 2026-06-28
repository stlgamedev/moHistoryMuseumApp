import { go, sections, restoredSections, ageTier } from "../state/game";
import { mode } from "../state/router";
import { capabilities } from "../state/capabilities";
import { RestorableFlag } from "../components/RestorableFlag";

export function SectionSelect() {
  const list = sections.value;
  const caps = capabilities.value;
  const scanRequestedButBlocked =
    mode.value === "scan" && (!caps.cameraApiAvailable || caps.cameraKnownBad);
  const reason =
    !caps.cameraApiAvailable
      ? "Your device doesn't support camera mode — we'll use the classic questions instead."
      : caps.lastError === "permission-denied"
        ? "Camera access was blocked. We'll use the classic questions; reload the page to try camera mode again."
        : "Camera wasn't available. We'll use the classic questions for now.";

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
      {scanRequestedButBlocked && (
        <div class="notice" role="status">{reason}</div>
      )}
      <RestorableFlag restored={restoredSections.value} class="flag--sm" />
      <h2>Pick a section</h2>
      {list.length === 0 ? (
        <p>Loading sections…</p>
      ) : (
        <div class="stack">
          {list.map((sec) => {
            const done = restoredSections.value.has(sec.id);
            return (
              <button
                key={sec.id}
                class="btn btn--primary btn--big btn--tile"
                onClick={() => go({ kind: "question", sectionId: sec.id, questionIndex: 0 })}
              >
                <span>{sec.name}</span>
                {done && <span class="badge-done">★ Restored</span>}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}

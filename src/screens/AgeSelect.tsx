import { go, selectAgeTier } from "../state/game";
import { AGE_TIERS } from "../content/types";

export function AgeSelect() {
  return (
    <main class="screen">
      <h2>What age are you?</h2>
      <div class="grid-2">
        {AGE_TIERS.map((tier) => (
          <button
            key={tier}
            class="btn btn--big btn--tile"
            onClick={() => {
              selectAgeTier(tier);
              go({ kind: "section-select" });
            }}
          >
            {tier}
          </button>
        ))}
      </div>
    </main>
  );
}

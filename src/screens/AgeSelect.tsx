import { go, selectAgeTier } from "../state/game";
import { AGE_TIERS, AGE_TIER_LABELS } from "../content/types";
import { StarburstBadge } from "../components/StarburstBadge";

export function AgeSelect() {
  return (
    <main class="screen screen--center">
      <StarburstBadge>How old are you?</StarburstBadge>
      <div class="stack stack--wide">
        {AGE_TIERS.map((tier) => (
          <button
            key={tier}
            class="btn btn--primary btn--big"
            onClick={() => {
              selectAgeTier(tier);
              go({ kind: "section-select" });
            }}
          >
            {AGE_TIER_LABELS[tier]}
          </button>
        ))}
      </div>
    </main>
  );
}

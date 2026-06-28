import { go, age } from "../state/game";
import { StarburstBadge } from "../components/StarburstBadge";

export function Welcome() {
  return (
    <main class="screen screen--center">
      <div class="brand-lockup">
        <p class="brand-lockup__museum">Missouri History Museum</p>
        <img
          class="brand-lockup__wordmark"
          src={`${import.meta.env.BASE_URL}brand/discovery-quest-wordmark.png`}
          alt="Discovery Quest"
        />
      </div>
      <StarburstBadge>Answer questions in each section to restore the St. Louis flag!</StarburstBadge>
      <div class="stack stack--wide">
        <button
          class="btn btn--primary btn--big"
          onClick={() => go({ kind: age.value ? "section-select" : "instructions" })}
        >
          Continue
        </button>
      </div>
    </main>
  );
}

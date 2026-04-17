import { go } from "../state/game";

export function Instructions() {
  return (
    <main class="screen">
      <h2>How to Play</h2>
      <ol class="instructions">
        <li>Pick your age group — questions will match.</li>
        <li>Choose a museum section you are visiting.</li>
        <li>Find the exhibit, then answer the question.</li>
        <li>Earn a patch for each section you finish.</li>
      </ol>
      <button class="btn btn--primary btn--big" onClick={() => go({ kind: "age-select" })}>
        Continue
      </button>
    </main>
  );
}

import { go } from "../state/game";

export function About() {
  return (
    <main class="screen">
      <h2>About</h2>
      <p>
        This scavenger hunt invites you to explore the Missouri History Museum. Answer
        questions tied to the exhibits you find, and earn a patch for each section you
        complete.
      </p>
      <button class="btn" onClick={() => go({ kind: "welcome" })}>Back</button>
    </main>
  );
}

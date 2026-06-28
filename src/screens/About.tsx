import { go } from "../state/game";

export function About() {
  return (
    <main class="screen">
      <h2>About</h2>
      <p>
        Discovery Quest invites you to explore the Missouri History Museum. Answer
        questions tied to the exhibits you find, and restore a piece of the St. Louis
        flag for each section you complete.
      </p>
      <button class="btn" onClick={() => go({ kind: "welcome" })}>Back</button>
    </main>
  );
}

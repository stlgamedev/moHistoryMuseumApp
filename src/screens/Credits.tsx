import { go } from "../state/game";

export function Credits() {
  return (
    <main class="screen">
      <h2>Credits</h2>
      <p>Developed by Wes and Kelsey for the Missouri History Museum.</p>
      <a class="brand-chip" href="https://stlgame.dev" target="_blank" rel="noreferrer">
        <img src={`${import.meta.env.BASE_URL}brand/stlgd-logo.svg`} alt="STLGameDev" />
      </a>
      <button class="btn" onClick={() => go({ kind: "welcome" })}>Back</button>
    </main>
  );
}

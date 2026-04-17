import { go, age } from "../state/game";

export function Welcome() {
  return (
    <main class="screen screen--center">
      <h1 class="welcome-title">Welcome, adventurer!</h1>
      <p class="welcome-sub">The Missouri History Museum Scavenger Hunt</p>
      <div class="stack">
        <button class="btn btn--primary btn--big" onClick={() => go({ kind: age.value ? "section-select" : "instructions" })}>
          Begin Game
        </button>
        <button class="btn" onClick={() => go({ kind: "about" })}>About</button>
        <button class="btn" onClick={() => go({ kind: "credits" })}>Credits</button>
      </div>
      <footer class="welcome-footer">
        <a class="brand-chip brand-chip--sm" href="https://stlgame.dev" target="_blank" rel="noreferrer">
          <img src={`${import.meta.env.BASE_URL}brand/stlgd-logo.svg`} alt="STLGameDev" />
        </a>
      </footer>
    </main>
  );
}

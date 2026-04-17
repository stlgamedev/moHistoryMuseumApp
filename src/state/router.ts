import { signal } from "@preact/signals";
import { config, type Mode } from "./config";

function parseHash(): Mode | null {
  const h = window.location.hash;
  if (h.startsWith("#/classic")) return "classic";
  if (h.startsWith("#/scan")) return "scan";
  return null;
}

export const mode = signal<Mode>("classic");

export function initRouter(): void {
  const fromHash = parseHash();
  if (fromHash) {
    mode.value = fromHash;
  } else {
    mode.value = config.value.defaultMode;
    window.location.replace(
      `${window.location.pathname}${window.location.search}#/${mode.value}`
    );
  }
  window.addEventListener("hashchange", () => {
    const m = parseHash();
    if (m && m !== mode.value) mode.value = m;
  });
}

export function setMode(next: Mode): void {
  if (mode.value === next) return;
  mode.value = next;
  window.location.hash = `#/${next}`;
}

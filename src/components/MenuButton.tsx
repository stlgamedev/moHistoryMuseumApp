import { useState } from "preact/hooks";
import { go, resetAll, screen } from "../state/game";
import { mode, setMode } from "../state/router";

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const hideOn = new Set(["welcome"]);
  if (hideOn.has(screen.value.kind)) return null;

  const currentMode = mode.value;
  const otherMode = currentMode === "scan" ? "classic" : "scan";

  return (
    <>
      <button
        class="menu-fab"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      </button>
      {open && (
        <div class="menu-sheet" role="dialog" aria-label="Menu">
          <button class="menu-item" onClick={() => { setOpen(false); go({ kind: "inventory" }); }}>
            Patches / Inventory
          </button>
          <button class="menu-item" onClick={() => { setOpen(false); go({ kind: "section-select" }); }}>
            Change Section
          </button>
          <button class="menu-item" onClick={() => {
            setOpen(false);
            setMode(otherMode);
            go({ kind: "section-select" });
          }}>
            Switch to {otherMode} mode
            <span class="menu-item__sub">currently: {currentMode}</span>
          </button>
          <button class="menu-item" onClick={() => { setOpen(false); resetAll(); }}>
            Restart
          </button>
          <button class="menu-item" onClick={() => { setOpen(false); go({ kind: "welcome" }); }}>
            Quit to Start
          </button>
          <button class="menu-close" onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
}

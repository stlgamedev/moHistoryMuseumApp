import { useState } from "preact/hooks";
import { go, resetAll, screen } from "../state/game";

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const hideOn = new Set(["welcome"]);
  if (hideOn.has(screen.value.kind)) return null;

  return (
    <>
      <button
        class="menu-fab"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
      {open && (
        <div class="menu-sheet" role="dialog" aria-label="Menu">
          <button class="menu-item" onClick={() => { setOpen(false); go({ kind: "inventory" }); }}>
            Patches / Inventory
          </button>
          <button class="menu-item" onClick={() => { setOpen(false); go({ kind: "section-select" }); }}>
            Change Section
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

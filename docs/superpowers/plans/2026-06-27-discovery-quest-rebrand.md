# Discovery Quest Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the museum scavenger-hunt app to "Discovery Quest" — purple theme, Cal Sans, starburst badge — and replace patch-collection with a St. Louis flag that restores region-by-region as sections are completed.

**Architecture:** Preact + `@preact/signals` SPA, static-built by Vite, deployed to GitHub Pages. Screens are switched on a `screen` signal; game state persists to `localStorage`. The rebrand re-skins all screens (CSS tokens + markup), renames the patch vocabulary to flag-restoration vocabulary with a back-compatible persistence migration, and adds two components: a reusable `StarburstBadge` and a `RestorableFlag` that stacks the colored flag under fade-away cover layers.

**Tech Stack:** TypeScript, Preact, `@preact/signals`, Vite, CSS custom properties, Cal Sans (OFL, self-hosted), psd-tools (one-off asset extraction).

## Global Constraints

- Age tiers are exactly `youth` | `teen` | `adult` (defined in `src/content/types.ts`); do not reintroduce other tiers.
- 5 sections ↔ 5 flag reveal-sets, 1:1. All 7 PSD cover layers must be assigned across the 5 sections so a complete game shows the fully-restored flag.
- Palette (sampled from mockups): `--bg #A1A1CE`, `--badge #775BA6`, `--btn #313178`, `--btn-fg #E8E7F4`, `--fg #26264F`, headline white `#FFFFFF`.
- Self-host Cal Sans; never depend on the Google Fonts CDN at runtime (museum wifi is unreliable).
- localStorage key stays `mohm-hunt-v1`. Migrate the `earnedPatches` field to `restoredSections` with a read-time fallback — never wipe existing progress.
- Do NOT touch question content JSON, scan/OCR logic, or the content pipeline. Content `patchName`/`patchImage` fields stay in place but go unused by the UI.
- STLGameDev appears in Credits only; Welcome shows the museum name + Discovery Quest wordmark co-equal.

## Verification approach (read before starting)

This project has **no test runner** (only `npm run typecheck` and `npm run build`), and the work is overwhelmingly visual. Per the project's no-over-engineering norm, we do **not** add a test framework. Each task's gate is:

1. `npm run typecheck` — must pass.
2. `npm run build` — must succeed.
3. For tasks with a visible result: `npm run dev`, open the printed localhost URL, and confirm the described visual outcome. (Dev server runs in the background; stop it with the task's stop note or leave it running across tasks.)
4. For the persistence migration (Task 3): an explicit browser-console check, given in that task.

Commit after each task.

---

## File structure

**New files**
- `public/flag/flag-base.png` + 7 covers (`cover-left`, `cover-topleft`, `cover-botleft`, `cover-topright`, `cover-botright`, `cover-river`, `cover-disc`) — extracted from `FlagPieces.psd`.
- `public/brand/discovery-quest-wordmark.png` — copied from `~/Downloads/discoveryQuestLogoTransparent.png`.
- `src/assets/CalSans-Regular.woff2` — self-hosted font (in `src/` so Vite fingerprints it and rewrites the URL under the GH Pages base path).
- `src/components/StarburstBadge.tsx` — 12-point star wrapping a short heading.
- `src/components/RestorableFlag.tsx` — colored flag with fade-away cover layers.
- `src/content/flag.ts` — cover ids, section→covers mapping, helpers.
- `src/screens/SectionRestored.tsx` — renamed from `PatchEarned.tsx`.
- `src/screens/Flag.tsx` — renamed from `Inventory.tsx`.

**Modified files**
- `src/styles.css` — palette tokens, `@font-face`, re-skin, new component classes.
- `src/state/storage.ts` — field rename + migration.
- `src/state/game.ts` — signal/function/screen-kind renames.
- `src/App.tsx` — router updates for renamed screens.
- `src/screens/{Welcome,AgeSelect,SectionSelect,Question,Hint,Instructions,About,Credits}.tsx` — re-skin + copy.
- `src/components/MenuButton.tsx` — flag wording + About/Credits entries.

---

### Task 1: Extract and place all assets

**Files:**
- Create: `public/flag/flag-base.png`, `public/flag/cover-left.png`, `public/flag/cover-topleft.png`, `public/flag/cover-botleft.png`, `public/flag/cover-topright.png`, `public/flag/cover-botright.png`, `public/flag/cover-river.png`, `public/flag/cover-disc.png`
- Create: `public/brand/discovery-quest-wordmark.png`
- Create: `src/assets/CalSans-Regular.woff2`

**Interfaces:**
- Produces: 8 flag PNGs (958×661 canvas), the wordmark PNG, and the Cal Sans woff2 — consumed by Tasks 2, 4, 5, 8.

- [ ] **Step 1: Write the PSD-extraction script**

Create `/private/tmp/claude-501/-Users-wes-workspace-moHistoryMuseumApp/0bb598cf-938e-4cb9-83b5-cf93498b6e2b/scratchpad/extract_flag.py`:

```python
from psd_tools import PSDImage
from PIL import Image
from pathlib import Path

SRC = Path.home() / "Downloads" / "FlagPieces.psd"
OUT = Path("/Users/wes/workspace/moHistoryMuseumApp/public/flag")
OUT.mkdir(parents=True, exist_ok=True)

NAMES = {
    "coloredflag": "flag-base",
    "Layer 6": "cover-left",
    "Layer 7": "cover-topleft",
    "Layer 9": "cover-botleft",
    "Layer 3": "cover-topright",
    "Layer 4": "cover-botright",
    "Layer 8": "cover-river",
    "Layer 5": "cover-disc",
}

psd = PSDImage.open(SRC)
W, H = psd.size
print("canvas", W, H)

def emit(layer):
    if layer.name not in NAMES:
        print("SKIP", layer.name); return
    img = layer.composite().convert("RGBA")
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x1, y1, _, _ = layer.bbox
    canvas.alpha_composite(img, (x1, y1))
    out = OUT / f"{NAMES[layer.name]}.png"
    canvas.save(out)
    print("wrote", out.name, canvas.size)

for top in psd:
    if top.is_group():
        for layer in top:
            emit(layer)
    else:
        emit(top)
```

- [ ] **Step 2: Run the extraction**

Run: `python3 -m pip install --quiet --user psd-tools Pillow && python3 "/private/tmp/claude-501/-Users-wes-workspace-moHistoryMuseumApp/0bb598cf-938e-4cb9-83b5-cf93498b6e2b/scratchpad/extract_flag.py"`
Expected: prints `canvas 958 661` then `wrote flag-base.png (958, 661)` and 7 `cover-*.png (958, 661)` lines.

- [ ] **Step 3: Verify the flag PNGs**

Run: `cd /Users/wes/workspace/moHistoryMuseumApp && ls public/flag && python3 -c "from PIL import Image; import glob; [print(p, Image.open(p).size) for p in sorted(glob.glob('public/flag/*.png'))]"`
Expected: 8 files, each `(958, 661)`.

- [ ] **Step 4: Copy the wordmark**

Run: `cp ~/Downloads/discoveryQuestLogoTransparent.png /Users/wes/workspace/moHistoryMuseumApp/public/brand/discovery-quest-wordmark.png && ls -la /Users/wes/workspace/moHistoryMuseumApp/public/brand/`
Expected: `discovery-quest-wordmark.png` present alongside `stlgd-logo.svg`.

- [ ] **Step 5: Download and self-host Cal Sans**

Run:
```bash
cd /Users/wes/workspace/moHistoryMuseumApp && mkdir -p src/assets
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
URL=$(curl -s -A "$UA" 'https://fonts.googleapis.com/css2?family=Cal+Sans' | grep -oE 'https://[^)]+\.woff2' | head -1)
echo "font url: $URL"
curl -sL "$URL" -o src/assets/CalSans-Regular.woff2
ls -la src/assets/CalSans-Regular.woff2
```
Expected: a non-empty `CalSans-Regular.woff2` (tens of KB). If the URL comes back empty, fall back to: `curl -sL https://raw.githubusercontent.com/githubnext/CalSans/main/fonts/webfonts/CalSans-SemiBold.woff2 -o src/assets/CalSans-Regular.woff2` and verify the file is non-empty.

- [ ] **Step 6: Commit**

```bash
cd /Users/wes/workspace/moHistoryMuseumApp
git add public/flag public/brand/discovery-quest-wordmark.png src/assets/CalSans-Regular.woff2
git commit -m "assets: extract flag layers, add wordmark + Cal Sans"
```

---

### Task 2: Theme tokens and font

**Files:**
- Modify: `src/styles.css:1-28` (the `:root` block and base `html,body` font), plus append an `@font-face`.

**Interfaces:**
- Produces: the purple palette CSS variables and a `--font-display` custom property used by all later re-skin tasks.

- [ ] **Step 1: Add the `@font-face` and replace the `:root` tokens**

Replace `src/styles.css` lines 1-13 (the `:root { ... }` block) with:

```css
@font-face {
  font-family: "Cal Sans";
  src: url("./assets/CalSans-Regular.woff2") format("woff2");
  font-weight: 400 700;
  font-display: swap;
}

:root {
  --bg: #a1a1ce;
  --badge: #775ba6;
  --btn: #313178;
  --btn-fg: #e8e7f4;
  --fg: #26264f;
  --muted: #4a4a73;
  --headline: #ffffff;
  --surface: #b4b4dc;
  --border: #8888bd;
  --radius: 14px;
  --shadow: 0 2px 6px rgba(20, 20, 60, 0.18);
  --tap-target: 56px;
  --font-display: "Cal Sans", system-ui, sans-serif;
}
```

- [ ] **Step 2: Point headings and buttons at the display font**

In `src/styles.css`, change the `h1, h2` rule (currently around line 60) so it reads:

```css
h1, h2 {
  margin: 0 0 0.25rem;
  color: var(--fg);
  font-weight: 700;
  font-family: var(--font-display);
}
```

And add `font-family: var(--font-display);` to the `.btn` rule (the `.btn { ... }` block around line 90), as the last property before the closing brace.

- [ ] **Step 3: Make primary buttons indigo**

Replace the `.btn--primary` rule (around line 118) with:

```css
.btn--primary {
  background: var(--btn);
  color: var(--btn-fg);
  border-color: var(--btn);
}
```

- [ ] **Step 4: Typecheck and build**

Run: `cd /Users/wes/workspace/moHistoryMuseumApp && npm run typecheck && npm run build`
Expected: both succeed (CSS is not type-checked, but the build must bundle the woff2 without error).

- [ ] **Step 5: Visual check**

Run: `npm run dev` (background) and open the printed URL. Expected: the whole app is now periwinkle with indigo primary buttons and Cal Sans headings, even though markup hasn't changed yet.

- [ ] **Step 6: Commit**

```bash
git add src/styles.css
git commit -m "style: purple Discovery Quest palette + Cal Sans"
```

---

### Task 3: Rename patch vocabulary to flag-restoration + migrate persistence

This task is a pure rename + migration: **no visual/markup change**. After it, the app builds and behaves identically, just with new identifiers, and old saved progress still loads.

**Files:**
- Modify: `src/state/storage.ts` (full rewrite below)
- Modify: `src/state/game.ts` (renames below)
- Modify: `src/App.tsx` (imports + screen kinds)
- Modify: `src/components/MenuButton.tsx` (screen kind), `src/screens/Question.tsx` (function name), `src/screens/SectionSelect.tsx` (signal name)
- Rename: `src/screens/PatchEarned.tsx` → `src/screens/SectionRestored.tsx`; `src/screens/Inventory.tsx` → `src/screens/Flag.tsx`

**Interfaces:**
- Produces: signal `restoredSections: Signal<Set<string>>`, function `restoreSection(id: string): void`, screen kinds `{ kind: "section-restored"; sectionId: string }` and `{ kind: "flag" }`, components `SectionRestored` and `Flag`. Consumed by Tasks 6-10.

- [ ] **Step 1: Rewrite `src/state/storage.ts`**

```typescript
const KEY = "mohm-hunt-v1";

export interface PersistedState {
  age?: number;
  ageTier?: string;
  restoredSections: string[]; // section ids
  completedQuestions: string[]; // `${sectionId}:${questionId}`
}

interface LegacyState {
  earnedPatches?: string[];
}

const DEFAULT: PersistedState = {
  restoredSections: [],
  completedQuestions: [],
};

export function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as PersistedState & LegacyState;
    return {
      ...DEFAULT,
      ...parsed,
      // Migrate pre-rebrand saves: earnedPatches -> restoredSections.
      restoredSections: parsed.restoredSections ?? parsed.earnedPatches ?? [],
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function savePersisted(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // quota or privacy mode — state will reset on reload
  }
}

export function resetPersisted(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}
```

- [ ] **Step 2: Apply renames in `src/state/game.ts`**

Make these exact replacements:

- In the `Screen` union, change `| { kind: "patch-earned"; sectionId: string }` → `| { kind: "section-restored"; sectionId: string }` and `| { kind: "inventory" }` → `| { kind: "flag" }`.
- Change `export const earnedPatches = signal<Set<string>>(new Set(persisted.earnedPatches));` → `export const restoredSections = signal<Set<string>>(new Set(persisted.restoredSections));`
- In the `activeSection` computed, change `s.kind !== "patch-earned"` → `s.kind !== "section-restored"`.
- In the persist `effect`, change `earnedPatches: [...earnedPatches.value],` → `restoredSections: [...restoredSections.value],`.
- Replace the `awardPatch` function with:

```typescript
export function restoreSection(sectionId: string): void {
  const next = new Set(restoredSections.value);
  next.add(sectionId);
  restoredSections.value = next;
}
```

- In `resetAll`, change `earnedPatches.value = new Set();` → `restoredSections.value = new Set();`.

- [ ] **Step 3: Rename the two screen files and their components**

```bash
cd /Users/wes/workspace/moHistoryMuseumApp
git mv src/screens/PatchEarned.tsx src/screens/SectionRestored.tsx
git mv src/screens/Inventory.tsx src/screens/Flag.tsx
```

In `src/screens/SectionRestored.tsx`: rename the component `export function PatchEarned` → `export function SectionRestored` (leave its markup/body unchanged for now; it still references `section.patchName`/`patchImage`, which still exist on the type).

In `src/screens/Flag.tsx`: rename `export function Inventory` → `export function Flag`, change the import `import { sections, earnedPatches, go } from "../state/game";` → `import { sections, restoredSections, go } from "../state/game";`, and change `const earned = earnedPatches.value;` → `const earned = restoredSections.value;`.

- [ ] **Step 4: Update `src/App.tsx`**

- Change import `import { PatchEarned } from "./screens/PatchEarned";` → `import { SectionRestored } from "./screens/SectionRestored";`
- Change import `import { Inventory } from "./screens/Inventory";` → `import { Flag } from "./screens/Flag";`
- Change `{s.kind === "patch-earned" && <PatchEarned sectionId={s.sectionId} />}` → `{s.kind === "section-restored" && <SectionRestored sectionId={s.sectionId} />}`
- Change `{s.kind === "inventory" && <Inventory />}` → `{s.kind === "flag" && <Flag />}`

- [ ] **Step 5: Update remaining references**

- `src/components/MenuButton.tsx`: change `go({ kind: "inventory" })` → `go({ kind: "flag" })` (the "Patches / Inventory" button; its label is updated in Task 8).
- `src/screens/Question.tsx`: change the import `awardPatch` → `restoreSection` (line 2) and the call in `advance()` `awardPatch(section!.id);` → `restoreSection(section!.id);`. Also change `go({ kind: "patch-earned", sectionId: section!.id });` → `go({ kind: "section-restored", sectionId: section!.id });`.
- `src/screens/SectionSelect.tsx`: change the import `earnedPatches` → `restoredSections` (line 1) and `const earned = earnedPatches.value.has(sec.id);` → `const earned = restoredSections.value.has(sec.id);`.

- [ ] **Step 6: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both pass with no remaining references to `earnedPatches`, `awardPatch`, `patch-earned`, `inventory`, `PatchEarned`, or `Inventory`. If typecheck complains, grep for the old name and fix: `grep -rn "earnedPatches\|awardPatch\|patch-earned\|PatchEarned\|\"inventory\"\|Inventory" src`.

- [ ] **Step 7: Verify the migration in the browser**

Run `npm run dev`. In the browser console at the app URL:
```js
localStorage.setItem("mohm-hunt-v1", JSON.stringify({age:30, ageTier:"adult", earnedPatches:["worlds-fair"], completedQuestions:[]}));
location.reload();
```
After reload, open the menu → the flag/inventory screen and confirm **World's Fair shows as restored/earned** (proving the legacy `earnedPatches` migrated). Then in console confirm the field was rewritten:
```js
JSON.parse(localStorage.getItem("mohm-hunt-v1")).restoredSections; // ["worlds-fair"]
```
Expected: `["worlds-fair"]`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: rename patch vocabulary to flag restoration + migrate save"
```

---

### Task 4: StarburstBadge component + Age-select re-skin

**Files:**
- Create: `src/components/StarburstBadge.tsx`
- Modify: `src/styles.css` (append badge classes)
- Modify: `src/screens/AgeSelect.tsx` (full rewrite below)

**Interfaces:**
- Produces: `StarburstBadge` — `export function StarburstBadge(props: { children: ComponentChildren; class?: string }): JSX.Element`. Consumed by Tasks 6 (Section-restored), 8 (Welcome).

- [ ] **Step 1: Create `src/components/StarburstBadge.tsx`**

```tsx
import type { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  class?: string;
}

// 12-point starburst badge. The path is a unit star scaled to the viewBox;
// the heading text sits centered on top via the .badge wrapper.
export function StarburstBadge({ children, class: extra = "" }: Props) {
  return (
    <div class={`badge ${extra}`}>
      <svg class="badge__star" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path
          fill="var(--badge)"
          d="M50 2 L58 16 L74 11 L73 28 L90 30 L80 44 L94 54 L78 60 L84 76 L67 74 L64 91 L50 81 L36 91 L33 74 L16 76 L22 60 L6 54 L20 44 L10 30 L27 28 L26 11 L42 16 Z"
        />
      </svg>
      <div class="badge__text">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Append badge styles to `src/styles.css`**

```css
.badge {
  position: relative;
  display: grid;
  place-items: center;
  width: min(78vw, 320px);
  aspect-ratio: 1;
  margin: 0 auto;
}

.badge__star {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 10px rgba(20, 20, 60, 0.25));
}

.badge__text {
  position: relative;
  z-index: 1;
  width: 64%;
  text-align: center;
  color: var(--headline);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
  line-height: 1.15;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
```

- [ ] **Step 3: Rewrite `src/screens/AgeSelect.tsx`**

```tsx
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
```

- [ ] **Step 4: Add the `.stack--wide` helper to `src/styles.css`**

```css
.stack--wide {
  width: 100%;
  max-width: 360px;
}
```

- [ ] **Step 5: Typecheck, build, visual check**

Run: `npm run typecheck && npm run build`, then `npm run dev`. Navigate to age-select (Welcome → Begin → through to the age screen, or set no age and reload). Expected: a purple starburst reading "HOW OLD ARE YOU?" above three stacked indigo Youth/Teen/Adult buttons — matching the mockup.

- [ ] **Step 6: Commit**

```bash
git add src/components/StarburstBadge.tsx src/screens/AgeSelect.tsx src/styles.css
git commit -m "feat: StarburstBadge + age-select re-skin"
```

---

### Task 5: Flag mapping + RestorableFlag component

**Files:**
- Create: `src/content/flag.ts`
- Create: `src/components/RestorableFlag.tsx`
- Modify: `src/styles.css` (append flag classes)

**Interfaces:**
- Consumes: the 8 flag PNGs from Task 1.
- Produces:
  - `src/content/flag.ts`: `FLAG_COVERS: string[]` (all 7 cover ids), `coversForSection(sectionId: string): string[]`, `FLAG_BASE_SRC: string` and `coverSrc(coverId: string): string` (BASE_URL-resolved paths).
  - `RestorableFlag` — `export function RestorableFlag(props: { restored: Set<string>; class?: string }): JSX.Element`. Consumed by Tasks 6, 7, 9.

- [ ] **Step 1: Create `src/content/flag.ts`**

```typescript
// Maps each section to the flag cover layer(s) it removes when completed.
// All 7 covers are assigned across the 5 sections so a fully-completed game
// reveals the whole flag. Grouping is provisional — verify visually in Task 6
// and swap cover ids between sections if the reveal order looks unbalanced.
const BASE = import.meta.env.BASE_URL;

export const SECTION_COVERS: Record<string, string[]> = {
  "worlds-fair": ["cover-topright"],
  "marvel-in-motion": ["cover-botright"],
  "forest-park-150": ["cover-left", "cover-topleft"],
  "collected": ["cover-botleft", "cover-river"],
  "made-in-stl": ["cover-disc"],
};

export const FLAG_COVERS: string[] = Object.values(SECTION_COVERS).flat();

export function coversForSection(sectionId: string): string[] {
  return SECTION_COVERS[sectionId] ?? [];
}

export const FLAG_BASE_SRC = `${BASE}flag/flag-base.png`;

export function coverSrc(coverId: string): string {
  return `${BASE}flag/${coverId}.png`;
}
```

- [ ] **Step 2: Create `src/components/RestorableFlag.tsx`**

```tsx
import { FLAG_COVERS, FLAG_BASE_SRC, coverSrc, coversForSection } from "../content/flag";

interface Props {
  restored: Set<string>; // restored section ids
  class?: string;
}

// Builds the set of cover ids that should still be visible (i.e. their
// section is NOT yet restored). Covers fade to 0 opacity via CSS when removed.
function hiddenCovers(restored: Set<string>): Set<string> {
  const gone = new Set<string>();
  for (const sectionId of restored) {
    for (const cover of coversForSection(sectionId)) gone.add(cover);
  }
  return gone;
}

export function RestorableFlag({ restored, class: extra = "" }: Props) {
  const gone = hiddenCovers(restored);
  return (
    <div class={`flag ${extra}`}>
      <img class="flag__base" src={FLAG_BASE_SRC} alt="St. Louis flag" />
      {FLAG_COVERS.map((cover) => (
        <img
          key={cover}
          class="flag__cover"
          src={coverSrc(cover)}
          alt=""
          aria-hidden="true"
          style={{ opacity: gone.has(cover) ? 0 : 1 }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Append flag styles to `src/styles.css`**

```css
.flag {
  position: relative;
  width: min(92vw, 480px);
  aspect-ratio: 958 / 661;
  margin: 0 auto;
}

.flag__base,
.flag__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.flag__cover {
  transition: opacity 600ms ease;
}

.flag--sm {
  width: min(60vw, 220px);
}
```

- [ ] **Step 4: Typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both pass. (No screen renders it yet; this verifies the component and asset paths compile.)

- [ ] **Step 5: Commit**

```bash
git add src/content/flag.ts src/components/RestorableFlag.tsx src/styles.css
git commit -m "feat: flag mapping + RestorableFlag component"
```

---

### Task 6: Section-restored screen

**Files:**
- Modify: `src/screens/SectionRestored.tsx` (full rewrite below)

**Interfaces:**
- Consumes: `restoredSections` (Task 3), `RestorableFlag` (Task 5), `StarburstBadge` (Task 4).

- [ ] **Step 1: Rewrite `src/screens/SectionRestored.tsx`**

```tsx
import { sections, restoredSections, go } from "../state/game";
import { RestorableFlag } from "../components/RestorableFlag";

interface Props {
  sectionId: string;
}

export function SectionRestored({ sectionId }: Props) {
  const restored = restoredSections.value;
  const count = restored.size;
  const total = sections.value.length;
  const allDone = count >= total && total > 0;

  return (
    <main class="screen screen--center">
      <h2>{allDone ? "You restored the whole flag!" : `You've restored ${count} section${count === 1 ? "" : "s"}!`}</h2>
      <RestorableFlag restored={restored} />
      <div class="stack stack--wide">
        <button class="btn btn--primary btn--big" onClick={() => go({ kind: "flag" })}>
          View Flag
        </button>
        <button class="btn btn--big" onClick={() => go({ kind: "section-select" })}>
          Pick Another Section
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck, build, visual check**

Run: `npm run typecheck && npm run build`, then `npm run dev`. Play through one section to completion (or in console set `localStorage` with one section's questions complete) to reach the section-restored screen. Expected: "You've restored 1 section!" above the flag with one region now in color and the rest still gray. **Verify the revealed region looks sensible**; if the grouping in `src/content/flag.ts` looks unbalanced, swap cover ids between sections and rebuild.

- [ ] **Step 3: Commit**

```bash
git add src/screens/SectionRestored.tsx src/content/flag.ts
git commit -m "feat: section-restored screen with restoring flag"
```

---

### Task 7: Flag screen (renamed Inventory)

**Files:**
- Modify: `src/screens/Flag.tsx` (full rewrite below)

**Interfaces:**
- Consumes: `sections`, `restoredSections`, `RestorableFlag`, `coversForSection`.

- [ ] **Step 1: Rewrite `src/screens/Flag.tsx`**

```tsx
import { sections, restoredSections, go } from "../state/game";
import { RestorableFlag } from "../components/RestorableFlag";

export function Flag() {
  const all = sections.value;
  const restored = restoredSections.value;

  return (
    <main class="screen screen--center">
      <h2>Your Flag</h2>
      <p class="flag-progress">{restored.size} of {all.length} sections restored</p>
      <RestorableFlag restored={restored} />
      <div class="flag-legend">
        {all.map((s) => (
          <div key={s.id} class={`flag-legend__row ${restored.has(s.id) ? "is-done" : ""}`}>
            <span class="flag-legend__mark">{restored.has(s.id) ? "★" : "○"}</span>
            <span>{s.name}</span>
          </div>
        ))}
      </div>
      <button class="btn btn--primary btn--big" onClick={() => go({ kind: "section-select" })}>
        Back to Sections
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Append legend styles to `src/styles.css`**

```css
.flag-progress {
  color: var(--muted);
  margin: 0;
}

.flag-legend {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  max-width: 360px;
  margin: 0.5rem auto 0;
}

.flag-legend__row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--muted);
}

.flag-legend__row.is-done {
  color: var(--fg);
  font-weight: 600;
}

.flag-legend__mark {
  width: 1.2rem;
  text-align: center;
}
```

- [ ] **Step 3: Typecheck, build, visual check**

Run: `npm run typecheck && npm run build`, then `npm run dev`. Open the menu → "Your Flag". Expected: the large flag with however many regions restored, a "N of 5 sections restored" line, and a legend listing all sections with ★/○ markers.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Flag.tsx src/styles.css
git commit -m "feat: Your Flag screen replaces patch inventory"
```

---

### Task 8: Welcome re-skin + menu wording

**Files:**
- Modify: `src/screens/Welcome.tsx` (full rewrite below)
- Modify: `src/components/MenuButton.tsx` (label + About/Credits entries)
- Modify: `src/styles.css` (append welcome/lockup classes)

**Interfaces:**
- Consumes: `StarburstBadge` (Task 4), `age` + `go` (existing).

- [ ] **Step 1: Rewrite `src/screens/Welcome.tsx`**

```tsx
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
```

- [ ] **Step 2: Append lockup styles to `src/styles.css`**

```css
.brand-lockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.brand-lockup__museum {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--fg);
}

.brand-lockup__wordmark {
  width: min(70vw, 280px);
  height: auto;
}
```

- [ ] **Step 3: Update the menu in `src/components/MenuButton.tsx`**

Change the first menu item's label from `Patches / Inventory` to `Your Flag` (the `go({ kind: "flag" })` target was already set in Task 3). Then add two new menu items immediately after the "Change Section" item:

```tsx
          <button class="menu-item" onClick={() => { setOpen(false); go({ kind: "about" }); }}>
            About
          </button>
          <button class="menu-item" onClick={() => { setOpen(false); go({ kind: "credits" }); }}>
            Credits
          </button>
```

- [ ] **Step 4: Typecheck, build, visual check**

Run: `npm run typecheck && npm run build`, then `npm run dev`. Expected: Welcome shows "MISSOURI HISTORY MUSEUM" above the Discovery Quest wordmark, the starburst CTA, and one Continue button. The ⋯ menu now lists "Your Flag", "Change Section", "About", "Credits", mode switch, Restart, Quit.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Welcome.tsx src/components/MenuButton.tsx src/styles.css
git commit -m "feat: Welcome lockup + CTA, About/Credits in menu"
```

---

### Task 9: Section-select re-skin with live flag progress

**Files:**
- Modify: `src/screens/SectionSelect.tsx` (full rewrite below)
- Modify: `src/styles.css` (append section-tile styles)

**Interfaces:**
- Consumes: `RestorableFlag` (Task 5), `restoredSections`/`sections`/`go`/`ageTier` (existing), `mode`/`capabilities` (existing).

- [ ] **Step 1: Rewrite `src/screens/SectionSelect.tsx`**

```tsx
import { go, sections, restoredSections, ageTier } from "../state/game";
import { mode } from "../state/router";
import { capabilities } from "../state/capabilities";
import { RestorableFlag } from "../components/RestorableFlag";

export function SectionSelect() {
  const list = sections.value;
  const caps = capabilities.value;
  const scanRequestedButBlocked =
    mode.value === "scan" && (!caps.cameraApiAvailable || caps.cameraKnownBad);
  const reason =
    !caps.cameraApiAvailable
      ? "Your device doesn't support camera mode — we'll use the classic questions instead."
      : caps.lastError === "permission-denied"
        ? "Camera access was blocked. We'll use the classic questions; reload the page to try camera mode again."
        : "Camera wasn't available. We'll use the classic questions for now.";

  if (!ageTier.value) {
    return (
      <main class="screen">
        <h2>Pick an age first</h2>
        <button class="btn btn--primary" onClick={() => go({ kind: "age-select" })}>Go</button>
      </main>
    );
  }

  return (
    <main class="screen">
      {scanRequestedButBlocked && (
        <div class="notice" role="status">{reason}</div>
      )}
      <RestorableFlag restored={restoredSections.value} class="flag--sm" />
      <h2>Pick a section</h2>
      {list.length === 0 ? (
        <p>Loading sections…</p>
      ) : (
        <div class="stack">
          {list.map((sec) => {
            const done = restoredSections.value.has(sec.id);
            return (
              <button
                key={sec.id}
                class="btn btn--primary btn--big btn--tile"
                onClick={() => go({ kind: "question", sectionId: sec.id, questionIndex: 0 })}
              >
                <span>{sec.name}</span>
                {done && <span class="badge-done">★ Restored</span>}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Append the restored-marker style to `src/styles.css`**

```css
.badge-done {
  font-size: 0.8rem;
  color: var(--headline);
  opacity: 0.85;
  font-weight: 600;
}
```

- [ ] **Step 3: Typecheck, build, visual check**

Run: `npm run typecheck && npm run build`, then `npm run dev`. Navigate to section-select. Expected: a small flag at the top reflecting current progress, then indigo section tiles; completed sections show "★ Restored".

- [ ] **Step 4: Commit**

```bash
git add src/screens/SectionSelect.tsx src/styles.css
git commit -m "feat: section-select shows live flag progress"
```

---

### Task 10: Copy + theme cleanup on remaining screens

Purge "patch" wording and confirm the purple theme reads well on Question, Hint, Instructions, About, Credits.

**Files:**
- Modify: `src/screens/Instructions.tsx`, `src/screens/About.tsx` (copy)
- Verify: `src/screens/Question.tsx`, `src/screens/Hint.tsx`, `src/screens/Credits.tsx` (theme already inherited; only copy/markup confirmation)

**Interfaces:** none new.

- [ ] **Step 1: Update `src/screens/Instructions.tsx` copy**

Replace the `<ol>` list's last item and keep the rest:

```tsx
import { go } from "../state/game";

export function Instructions() {
  return (
    <main class="screen">
      <h2>How to Play</h2>
      <ol class="instructions">
        <li>Pick your age group — questions will match.</li>
        <li>Choose a museum section you are visiting.</li>
        <li>Find the exhibit, then answer the question.</li>
        <li>Restore a piece of the St. Louis flag for each section you finish.</li>
      </ol>
      <button class="btn btn--primary btn--big" onClick={() => go({ kind: "age-select" })}>
        Continue
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Update `src/screens/About.tsx` copy**

```tsx
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
```

- [ ] **Step 3: Confirm no stray "patch" copy remains**

Run: `grep -rin "patch" src` 
Expected: no matches in screen copy. (Matches inside content JSON `patchName`/`patchImage` are out of scope and live under `public/`, not `src/`, so they won't appear.)

- [ ] **Step 4: Typecheck, build, full visual pass**

Run: `npm run typecheck && npm run build`, then `npm run dev`. Walk the full flow: Welcome → Continue → Instructions → age-select → section-select → answer a full section → section-restored (flag region reveals) → Your Flag → menu (About/Credits read correctly). Expected: cohesive purple Discovery Quest theme throughout, flag restores as sections complete.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Instructions.tsx src/screens/About.tsx
git commit -m "content: flag-restoration copy on instructions + about"
```

---

## Self-review notes

- **Spec coverage:** tokens+font (T2), StarburstBadge (T4), RestorableFlag (T5), flag↔section mapping (T5), all 7 screens (T4,T6,T7,T8,T9,T10), state rename+migration (T3), assets (T1), STLGameDev in Credits only / Welcome co-equal lockup (T8). All spec sections map to a task.
- **Migration** preserves progress via read-time fallback and is explicitly browser-verified (T3 Step 7).
- **Type consistency:** `restoredSections`, `restoreSection`, `coversForSection`, `RestorableFlag`, `StarburstBadge`, screen kinds `section-restored`/`flag` are used identically across tasks.
- **Open items from spec** (exact `--btn-fg`, cover grouping) are resolved with concrete provisional values and a visual-verify-and-adjust step (T6 Step 2).

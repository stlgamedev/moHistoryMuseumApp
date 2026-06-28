# Discovery Quest — Visual Rebrand & Flag-Restoration Mechanic

**Date:** 2026-06-27
**Status:** Approved (design), pending implementation plan

## Overview

A full visual rebrand of the Missouri History Museum scavenger-hunt app, in one
pass. Three changes land together:

1. **Brand** — add the "Discovery Quest" wordmark, co-equal with the Missouri
   History Museum name on the Welcome screen. STLGameDev moves to Credits only.
2. **Look** — replace the brown/cream/gold "scout patch" theme with the purple
   mockup system (periwinkle bg, indigo buttons, starburst badge, Cal Sans
   display font).
3. **Meta-progression** — replace "collect a patch per section" with "restore
   the St. Louis flag." A full-color flag sits under opaque cover layers;
   finishing a section fades away that section's cover region, revealing the
   color beneath. Finish all 5 sections → the flag is fully restored.

The app is ~8 screens; the rebrand touches all of them but the question/answer
logic is unchanged.

## Design tokens (`src/styles.css`)

Sampled from the mockups:

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#A1A1CE` | periwinkle page background |
| `--badge` | `#775BA6` | starburst badge fill |
| `--btn` | `#313178` | deep-indigo buttons |
| `--btn-fg` | `#E8E7F4` | button label (light lavender; refine vs. mockup during build) |
| `--fg` | `#26264F` | body text on lavender |
| `--headline` | `#FFFFFF` | text inside the starburst badge |

**Typography**
- Display (headings, buttons, badge text): **Cal Sans**, self-hosted as woff2
  under `public/fonts/` with an `@font-face` rule. Cal Sans is OFL-licensed, so
  self-hosting is fine. We self-host rather than use the Google Fonts CDN
  because the app runs inside a museum with unreliable wifi.
- Body: existing system-ui stack.
- The "Discovery Quest" wordmark is a logo image, not a font.

## New components

### `StarburstBadge`
The 12-point star (traced from the mockup to a clean inline SVG, fill
`--badge`) wrapping a short heading in white Cal Sans. Reused on Welcome,
Age-select, and as the backdrop behind the restored screen's flag. Props: the
heading text (or children) and an optional size.

### `RestorableFlag`
Renders `flag-base.png` (full color) with the cover PNGs stacked absolutely on
top at the same canvas size. Each cover is tagged with the section that reveals
it; when that section is in the restored set, the cover transitions opacity
1 → 0 (CSS, ~600ms). Props: the restored-section `Set<string>`. Used small on
Section-select (live progress), animating on Section-restored, and large on the
Flag screen.

## Flag ↔ section mapping

The PSD (`FlagPieces.psd`, 958×661) contains `coloredflag` plus **7 cover
layers**: a left strip, top-left, top-right, bottom-left, bottom-right, a
right-side river band, and a center square (the disc). We have **5 sections**,
so the 7 covers are grouped into 5 reveal-sets, one per section, in a constant
(e.g. `src/content/flag.ts`):

- Each section maps to one or two cover layers.
- Mapping is deterministic — a given section always reveals the same region.
- Ordered so the **center disc reveals last** as the finale (the section most
  likely finished last, or simply presented last).

Exact section→cover assignment is an implementation detail finalized when the
covers are exported and previewed; the only hard requirement is that all 7
covers are spoken for across the 5 sections so a 100%-complete game shows the
fully-restored flag.

## Screens

1. **Welcome** — periwinkle bg; Missouri History Museum name + Discovery Quest
   wordmark as a co-equal lockup; `StarburstBadge` reading "Answer questions in
   each section to restore the St. Louis flag!"; one indigo CONTINUE button.
   About/Credits move into the existing ⋯ menu FAB (collapses the old
   three-button Welcome to match the mockups).
2. **Age-select** — `StarburstBadge` "How old are you?" + three indigo
   Youth/Teen/Adult buttons. Structure already matches; re-skin only.
3. **Section-select** — small `RestorableFlag` at top as live progress; indigo
   section tiles; completed sections marked.
4. **Question / Hint** — purple-themed prompt, indigo choice buttons / fill
   input. Answer/scan/hint logic unchanged.
5. **Section-restored** (replaces Patch-earned) — "You've restored N section(s)!"
   headline; `RestorableFlag` animating the newly revealed region; CONTINUE.
6. **Flag** (replaces Inventory) — large `RestorableFlag` + a legend of which
   section restored which region; restored count.
7. **Menu / About / Credits** — re-skinned; Credits keeps STLGameDev + the
   museum acknowledgment.

## State & persistence (full rename + migration)

Rename the "patch" vocabulary to flag-restoration vocabulary; no confusing
legacy names left behind:

- `earnedPatches` signal → `restoredSections`
- `awardPatch(id)` → `restoreSection(id)`
- Screen kind `patch-earned` → `section-restored`; `inventory` → `flag`
- `PatchEarned.tsx` → `SectionRestored.tsx`; `Inventory.tsx` → `Flag.tsx`
- Update `activeSection` computed, `resetAll`, the persist `effect`, `App.tsx`
  router, and any `earnedPatches` readers (Section-select, etc.)

**Migration (preserve existing progress):** keep the localStorage key
`mohm-hunt-v1`. Rename the persisted field `earnedPatches` → `restoredSections`,
and in `loadPersisted` read it back-compatibly:
`restoredSections: parsed.restoredSections ?? parsed.earnedPatches ?? []`. The
next save writes the new field. No key bump, so no wipe.

Per-section `patch.svg` files and the content JSON `patchName` / `patchImage`
fields are no longer used by the UI (flag art is global). Leave the content JSON
untouched for now to avoid churn on the approval-gated content; the unused patch
SVGs and fields can be cleaned up in a later pass. `Section.patchImage` /
`patchName` stay in the type but are unreferenced by screens.

## Assets

| Asset | Source | Destination |
|-------|--------|-------------|
| `flag-base.png` + 7 cover PNGs | extract from `FlagPieces.psd` via psd-tools (proven working), same 958×661 canvas, transparent | `public/flag/` |
| Discovery Quest wordmark | `~/Downloads/discoveryQuestLogoTransparent.png` (322×189 RGBA) | `public/brand/` |
| Starburst badge | trace mockup → inline SVG component | `src/components/` |
| Cal Sans | download OFL woff2 | `public/fonts/` |

Wordmark is low-res (322px); if it looks soft at display size, trace it to SVG.

## Out of scope

- No changes to question content, scan/OCR logic, or the content pipeline.
- No new sections (5 sections ↔ 5 flag regions stays 1:1). If a 6th section is
  added later, add a 6th reveal-set.
- Cleanup of now-unused per-section `patch.svg` files and content fields is
  deferred to a later pass.

## Open items

- Exact `--btn-fg` and the section→cover grouping get finalized against the
  exported covers during build (visual preview).

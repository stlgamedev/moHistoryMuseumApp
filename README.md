# MO History Museum — Scavenger Hunt

A mobile-first web app for a quiz-based scavenger hunt at the Missouri History Museum. Visitors scan a QR code, pick their age group, choose a section, and earn patches for answering exhibit questions correctly.

## Stack

- **Vite** + **TypeScript** + **Preact** + `@preact/signals`
- Static site — deploys to GitHub Pages
- Content-driven: sections live as JSON + images in `public/content/`

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:5173/moHistoryMuseumApp/` (the `base` path matches the GH Pages URL).

## Build

```sh
npm run build
npm run preview
```

## Add a new section (no code changes)

1. Create `public/content/<your-section>/section.json`. See `public/content/collections/section.json` for the schema.
2. Drop any images into `public/content/<your-section>/images/`. Reference them by relative path in the JSON.
3. Add a patch graphic at `public/content/<your-section>/patch.svg` (or png/jpg).
4. Register the section in `public/content/sections.json`:
   ```json
   { "sections": [
     { "id": "collections", "path": "collections/section.json" },
     { "id": "your-section", "path": "your-section/section.json" }
   ]}
   ```
5. Commit + push. GitHub Actions redeploys on merge to `main`.

## Content schema

Each question has one variant per age tier: `3-5`, `5-10`, `10-15`, `15-20`.

Variant types:
- `multi-image` — multiple choice with a picture per option (youngest kids)
- `multi-text` — multiple choice, text only
- `fill-blank` — typed answer; add `acceptableAnswers` for alternates

Each question can include a `hintImage` or `hintText` — shown when a visitor gets the answer wrong, to guide them to the exhibit.

## Deploy

The workflow in `.github/workflows/deploy.yml` builds on push to `main` and publishes to Pages. In your GitHub repo settings, set **Pages → Source = GitHub Actions**.

If you host at `https://<user>.github.io/<repo>/`, the default `VITE_BASE` of `/moHistoryMuseumApp/` needs to match your repo name — the workflow sets this automatically from the repo name.

## What's built vs. next

**Built**
- Welcome → About → Credits
- Age gate (4 tiers)
- Section picker
- Three question types (multi-image, multi-text, fill-blank)
- Wrong-answer hint flow
- Patch reward + inventory with locked/earned states
- Persistent menu (Inventory / Change Section / Restart / Quit)
- localStorage persistence of age, earned patches, completed questions
- One example section (Collections → Anna the wolf) with all 4 age variants

**Not yet**
- Live camera/QR scanning at exhibits (the `CameraCapture` component is a stub using the native file input with `capture="environment"`)
- Offline / PWA
- Real art — all current images are placeholder SVGs
- Real museum content beyond the wolf example

## License & content ownership

The code in this repository is MIT-licensed — see [LICENSE](./LICENSE).

This app is a partnership between [STLGameDev](https://stlgame.dev) and the
Missouri History Museum. The content under `public/content/` (quiz questions,
exhibit photos, patch artwork, and related assets) is © 2026 STLGameDev and
is **not** covered by the MIT license. Some assets are provided by the Museum
and used here with permission; please don't redistribute museum-provided
assets without permission from both STLGameDev and the Museum.

Source art (Affinity files, pre-export PNG/SVG masters) lives in a local
`resources/` directory that is git-ignored. Exported assets used by the app
live under `public/brand/` and `public/content/`.

# Authoring Questions

This guide is for content creators writing scavenger-hunt questions for the museum app. No coding required — you'll be filling out a JSON file.

## How content is organized

```
public/content/
├── sections.json                 ← list of all sections
└── <section-id>/
    ├── section.json              ← the section's questions
    ├── patch.svg                 ← image for the earned-patch screen
    └── images/                   ← any images referenced by questions
```

Each **section** is one part of the museum (e.g. "Collections"). A section earns the kid a patch when finished. A section contains a list of **questions**, and each question has 3 **variants** — one per audience (`youth`, `teen`, `adult`). The app picks the variant that matches the player's chosen group.

## Adding a new section

1. Create `public/content/<your-section-id>/section.json` (use a short, lowercase id like `dinosaurs`).
2. Drop a `patch.svg` in that folder for the patch image.
3. Make an `images/` subfolder for any question images.
4. Register the section in `public/content/sections.json`:

```json
{
  "sections": [
    { "id": "collections", "path": "collections/section.json" },
    { "id": "dinosaurs",   "path": "dinosaurs/section.json" }
  ]
}
```

5. Commit and push. The site redeploys automatically.

## Section template

Copy this and fill it in:

```json
{
  "id": "dinosaurs",
  "name": "Dinosaurs",
  "patchName": "Dinosaur Patch",
  "patchImage": "patch.svg",
  "description": "Fossils and life-size replicas in the Mesozoic hall.",
  "questions": [
    /* questions go here — see below */
  ]
}
```

| Field         | Required | Notes                                                         |
|---------------|----------|---------------------------------------------------------------|
| `id`          | yes      | Match the folder name.                                         |
| `name`        | yes      | Shown to the player on the section-select screen.              |
| `patchName`   | no       | Shown on the "patch earned" screen. Defaults to `name`.        |
| `patchImage`  | yes      | Path relative to the section folder (almost always `patch.svg`).|
| `description` | no       | One sentence shown on section select.                          |
| `questions`   | yes      | The list of questions (see next section).                      |

## Anatomy of a question

A question is one museum object/topic. It has a unique `id`, optional hint image and text, and a `variants` array with one entry per audience:

```json
{
  "id": "t-rex",
  "topic": "T. Rex",
  "hintImage": "images/trex-hint.svg",
  "hintText": "Look for the giant skeleton in the Mesozoic hall.",
  "variants": [
    { "ageTier": "youth", /* ... */ },
    { "ageTier": "teen",  /* ... */ },
    { "ageTier": "adult", /* ... */ }
  ]
}
```

| Field        | Required | Notes                                                       |
|--------------|----------|-------------------------------------------------------------|
| `id`         | yes      | Unique within the section. Lowercase-with-dashes.            |
| `topic`      | no       | Short label for the question.                                |
| `hintImage`  | no       | Image shown if the kid asks for a hint.                      |
| `hintText`   | no       | Text shown alongside the hint image.                         |
| `variants`   | yes      | One per audience — see below.                                |

**Tip:** all three audiences should be present, but they're allowed to ask the same thing in different ways. The point is to scale difficulty.

## The three variant types

Every variant must have an `ageTier` (`"youth"`, `"teen"`, or `"adult"`) and a `prompt`. Pick one of these three formats:

### 1. `multi-image` — pick the right picture

Best for non-readers. Three illustrated choices, one is correct.

```json
{
  "type": "multi-image",
  "ageTier": "youth",
  "prompt": "Which one is the T. Rex?",
  "choices": [
    { "label": "T. Rex",     "image": "images/choice-trex.svg",     "correct": true },
    { "label": "Triceratops","image": "images/choice-triceratops.svg" },
    { "label": "Stegosaurus","image": "images/choice-stego.svg" }
  ]
}
```

### 2. `multi-text` — pick the right word

Same idea but text-only. Use for early readers.

```json
{
  "type": "multi-text",
  "ageTier": "teen",
  "prompt": "What kind of dinosaur ate meat?",
  "choices": [
    { "label": "T. Rex", "correct": true },
    { "label": "Triceratops" },
    { "label": "Brachiosaurus" }
  ]
}
```

### 3. `fill-blank` — type the answer

For teens and adults. Provide the canonical `answer` and any `acceptableAnswers` to forgive misspellings.

```json
{
  "type": "fill-blank",
  "ageTier": "adult",
  "prompt": "The giant meat-eater on display is called _____.",
  "answer": "Tyrannosaurus",
  "acceptableAnswers": ["T. Rex", "T-Rex", "Tyrannosaurus Rex"]
}
```

Comparisons are case-insensitive and ignore extra whitespace.

## Adding a "scan" challenge (optional)

Any variant can include a `scan` block. Instead of (or in addition to) answering, the kid points the camera at something and the app verifies it. Two kinds:

### OCR — "find a plaque that says X"

```json
"scan": {
  "prompt": "Find a plaque that mentions the word \"extinct\".",
  "hintText": "Plaques near the dinosaurs often talk about extinction.",
  "verification": {
    "kind": "ocr",
    "anyOf": ["extinct", "extinction"]
  }
}
```

The scan succeeds if **any** word in `anyOf` shows up in the camera image. Provide a couple of variations (singular/plural, common typos) to be forgiving.

### Object — "find a [thing]"

```json
"scan": {
  "prompt": "Find a dinosaur skeleton anywhere in the museum.",
  "hintText": "Skull, full skeleton, or model — any dinosaur counts.",
  "verification": {
    "kind": "object",
    "classes": ["tyrannosaurus", "triceratops", "stegosaurus", "dinosaur"]
  }
}
```

The scan succeeds if the camera sees any of the listed object classes. Use plain everyday names — the model recognizes things like "wolf", "chair", "book", "skeleton". List a few synonyms.

> ⚠️ **OCR is more reliable than object detection.** When in doubt, prefer asking kids to find a **word on a plaque** over asking the model to recognize a thing. Object detection works well for common items but can miss museum-specific things.

## Image guidelines

- Put images in `public/content/<section-id>/images/`.
- Reference them as `"images/your-file.svg"` from JSON (relative to the section folder).
- **SVG preferred** for illustrations (sharp at any size, small file). PNG/JPG are fine for photos.
- Keep choice images visually distinct — the same kid is comparing them side-by-side.
- Hint images should be a stylized, non-spoilery clue (silhouette, partial view, etc.).

## A complete example

Here's a full question with all three tiers and a scan on each:

```json
{
  "id": "t-rex",
  "topic": "T. Rex",
  "hintImage": "images/trex-hint.svg",
  "hintText": "Look for the giant skeleton in the Mesozoic hall.",
  "variants": [
    {
      "type": "multi-image",
      "ageTier": "youth",
      "prompt": "Which one is the T. Rex?",
      "choices": [
        { "label": "T. Rex",      "image": "images/choice-trex.svg",     "correct": true },
        { "label": "Triceratops", "image": "images/choice-triceratops.svg" },
        { "label": "Stegosaurus", "image": "images/choice-stego.svg" }
      ],
      "scan": {
        "prompt": "Find a dinosaur in the museum!",
        "verification": { "kind": "object", "classes": ["dinosaur", "skeleton"] }
      }
    },
    {
      "type": "multi-text",
      "ageTier": "teen",
      "prompt": "What did T. Rex eat?",
      "choices": [
        { "label": "Meat", "correct": true },
        { "label": "Plants" },
        { "label": "Fish" }
      ],
      "scan": {
        "prompt": "Find a plaque with the word \"carnivore\".",
        "verification": { "kind": "ocr", "anyOf": ["carnivore", "meat-eater"] }
      }
    },
    {
      "type": "fill-blank",
      "ageTier": "adult",
      "prompt": "The giant meat-eater here is called _____.",
      "answer": "Tyrannosaurus",
      "acceptableAnswers": ["T. Rex", "T-Rex", "Tyrannosaurus Rex"],
      "scan": {
        "prompt": "Find the dinosaur's full name on a plaque.",
        "verification": { "kind": "ocr", "anyOf": ["Tyrannosaurus"] }
      }
    }
  ]
}
```

## Quick checklist before you ship

- [ ] Section folder created under `public/content/`
- [ ] `patch.svg` and any `images/` added
- [ ] Section listed in `public/content/sections.json`
- [ ] Every question has all 3 audiences (youth, teen, adult)
- [ ] Every variant has `ageTier`, `prompt`, and either `choices` (multi-*) or `answer` (fill-blank)
- [ ] All image paths resolve (no typos)
- [ ] JSON is valid (paste into [jsonlint.com](https://jsonlint.com) if unsure)

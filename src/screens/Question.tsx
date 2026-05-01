import { useMemo, useState } from "preact/hooks";
import { sections, ageTier, go, awardPatch, markComplete } from "../state/game";
import { mode } from "../state/router";
import { capabilities } from "../state/capabilities";
import type { Question as Q, QuestionVariant, ScanBlock } from "../content/types";
import { TextScanner } from "../components/TextScanner";
import { ObjectScanner } from "../components/ObjectScanner";

interface Props {
  sectionId: string;
  questionIndex: number;
}

function pickVariant(q: Q, tier: string): QuestionVariant | undefined {
  return q.variants.find((v) => v.ageTier === tier) ?? q.variants[0];
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function Question({ sectionId, questionIndex }: Props) {
  const section = sections.value.find((s) => s.id === sectionId);
  const tier = ageTier.value ?? "youth";
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [typed, setTyped] = useState("");

  const q = section?.questions[questionIndex];
  const variant = useMemo(() => (q ? pickVariant(q, tier) : undefined), [q, tier]);

  const caps = capabilities.value;
  const scanBlocked = !caps.cameraApiAvailable || caps.cameraKnownBad;
  const useScan = mode.value === "scan" && !!variant?.scan && !scanBlocked;
  const scan: ScanBlock | undefined = variant?.scan;

  if (!section) return <main class="screen"><p>Section not found.</p></main>;
  if (!q || !variant) {
    return (
      <main class="screen">
        <p>No questions available.</p>
        <button class="btn" onClick={() => go({ kind: "section-select" })}>Back</button>
      </main>
    );
  }

  function advance() {
    markComplete(section!.id, q!.id);
    const nextIdx = questionIndex + 1;
    if (nextIdx < section!.questions.length) {
      go({ kind: "question", sectionId: section!.id, questionIndex: nextIdx });
    } else {
      awardPatch(section!.id);
      go({ kind: "patch-earned", sectionId: section!.id });
    }
  }

  function handleWrong() {
    const next = wrongAttempts + 1;
    setWrongAttempts(next);
    if (next >= 1) {
      go({ kind: "hint", sectionId, questionIndex });
    }
  }

  if (useScan && scan) {
    const v = scan.verification;
    // onFallbackToClassic: the capabilities signal is already flipped inside the scanner;
    // nothing else to do — this component re-renders and falls into the classic branch below.
    const noopFallback = () => { /* capabilities signal change triggers re-render */ };
    if (v.kind === "ocr") {
      return (
        <TextScanner
          targets={v.anyOf}
          prompt={scan.prompt}
          hintText={scan.hintText}
          onMatch={advance}
          onCancel={() => go({ kind: "hint", sectionId, questionIndex })}
          onFallbackToClassic={noopFallback}
        />
      );
    }
    return (
      <ObjectScanner
        classes={v.classes}
        prompt={scan.prompt}
        hintText={scan.hintText}
        minConfidence={scan.minConfidence}
        onMatch={advance}
        onCancel={() => go({ kind: "hint", sectionId, questionIndex })}
        onFallbackToClassic={noopFallback}
      />
    );
  }

  return (
    <main class="screen">
      <div class="q-topic">{section.name}</div>
      <h2 class="q-prompt">{variant.prompt}</h2>

      {variant.type === "multi-image" && (
        <div class="grid-2">
          {variant.choices.map((c, i) => (
            <button
              key={i}
              class="choice choice--image"
              onClick={() => (c.correct ? advance() : handleWrong())}
            >
              {c.image && <img src={c.image} alt={c.label} />}
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      )}

      {variant.type === "multi-text" && (
        <div class="stack">
          {variant.choices.map((c, i) => (
            <button
              key={i}
              class="btn btn--big"
              onClick={() => (c.correct ? advance() : handleWrong())}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {variant.type === "fill-blank" && (
        <form
          class="stack"
          onSubmit={(e) => {
            e.preventDefault();
            const accepted = [variant.answer, ...(variant.acceptableAnswers ?? [])].map(normalize);
            if (accepted.includes(normalize(typed))) {
              advance();
            } else {
              handleWrong();
            }
          }}
        >
          <input
            class="fill-input"
            type="text"
            autocomplete="off"
            autocorrect="off"
            spellcheck={false}
            value={typed}
            onInput={(e) => setTyped((e.currentTarget as HTMLInputElement).value)}
            placeholder="Type your answer"
          />
          <button type="submit" class="btn btn--primary btn--big" disabled={typed.trim().length === 0}>
            Submit
          </button>
        </form>
      )}

      {wrongAttempts > 0 && (
        <p class="q-wrong">Not quite — try again.</p>
      )}
    </main>
  );
}

import { useEffect, useMemo, useState } from "preact/hooks";
import { sections, ageTier, go, awardPatch, markComplete } from "../state/game";
import { mode } from "../state/router";
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
  const tier = ageTier.value ?? "5-10";
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [typed, setTyped] = useState("");

  const q = section?.questions[questionIndex];
  const variant = useMemo(() => (q ? pickVariant(q, tier) : undefined), [q, tier]);

  const useScan = mode.value === "scan" && !!variant?.scan;
  const scan: ScanBlock | undefined = variant?.scan;

  // In scan mode, skip questions without a scan block.
  useEffect(() => {
    if (!section || !q || !variant) return;
    if (mode.value === "scan" && !variant.scan) {
      advance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.value, sectionId, questionIndex]);

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
    // When advancing in scan mode, keep skipping questions without a scan block.
    const findNextPlayable = (idx: number): number => {
      if (mode.value !== "scan") return idx;
      let i = idx;
      while (i < section!.questions.length) {
        const nv = pickVariant(section!.questions[i]!, tier);
        if (nv?.scan) return i;
        i++;
      }
      return section!.questions.length;
    };
    const target = findNextPlayable(nextIdx);
    if (target < section!.questions.length) {
      go({ kind: "question", sectionId: section!.id, questionIndex: target });
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
    if (v.kind === "ocr") {
      return (
        <TextScanner
          targets={v.anyOf}
          prompt={scan.prompt}
          hintText={scan.hintText}
          onMatch={advance}
          onCancel={() => go({ kind: "hint", sectionId, questionIndex })}
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

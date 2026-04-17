import { sections, go } from "../state/game";

interface Props {
  sectionId: string;
  questionIndex: number;
}

export function Hint({ sectionId, questionIndex }: Props) {
  const section = sections.value.find((s) => s.id === sectionId);
  const q = section?.questions[questionIndex];

  return (
    <main class="screen">
      <h2>Are you in front of this exhibit?</h2>
      {q?.hintImage ? (
        <img class="hint-image" src={q.hintImage} alt="Exhibit hint" />
      ) : (
        <p class="hint-text">{q?.hintText ?? "Find the exhibit that goes with this question."}</p>
      )}
      <p>Look carefully — the answer is right there with the display.</p>
      <button
        class="btn btn--primary btn--big"
        onClick={() => go({ kind: "question", sectionId, questionIndex })}
      >
        Try Again
      </button>
    </main>
  );
}

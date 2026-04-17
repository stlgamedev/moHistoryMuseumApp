import type { CameraErrorKind } from "../state/capabilities";

interface Props {
  kind: CameraErrorKind;
  onUseClassic: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

interface Message {
  title: string;
  body: string;
  canRetry: boolean;
}

function messageFor(kind: CameraErrorKind): Message {
  switch (kind) {
    case "permission-denied":
      return {
        title: "Camera access blocked",
        body: "You (or a previous visitor) blocked camera access. To use camera mode, reload the page and tap \"Allow\" when your browser asks. Or keep playing the classic way.",
        canRetry: false,
      };
    case "no-device":
      return {
        title: "No camera found",
        body: "This device doesn't have a camera we can use. You can still play — just answer the questions the classic way.",
        canRetry: false,
      };
    case "in-use":
      return {
        title: "Camera is busy",
        body: "Another app or tab may be using your camera. Close it and try again, or play the classic way.",
        canRetry: true,
      };
    default:
      return {
        title: "Camera trouble",
        body: "Something went wrong opening the camera. Try again, or answer the classic way.",
        canRetry: true,
      };
  }
}

export function ScannerError({ kind, onUseClassic, onRetry, onCancel }: Props) {
  const m = messageFor(kind);
  return (
    <div class="scanner-error-panel">
      <div class="scanner-error-card">
        <h2>{m.title}</h2>
        <p>{m.body}</p>
        <div class="stack">
          <button class="btn btn--primary btn--big" onClick={onUseClassic}>
            Answer the classic way
          </button>
          {m.canRetry && (
            <button class="btn btn--big" onClick={onRetry}>
              Try camera again
            </button>
          )}
          <button class="btn" onClick={onCancel}>
            Back to sections
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  targets: string[];
  prompt: string;
  hintText?: string;
  onMatch: () => void;
  onCancel: () => void;
}

type Status = "loading-camera" | "loading-model" | "scanning" | "matched" | "error";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function containsAny(haystack: string, needles: string[]): string | null {
  const norm = normalize(haystack);
  for (const needle of needles) {
    if (norm.includes(normalize(needle))) return needle;
  }
  return null;
}

export function TextScanner({ targets, prompt, hintText, onMatch, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<Status>("loading-camera");
  const [lastText, setLastText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    let worker: { recognize: (c: HTMLCanvasElement) => Promise<{ data: { text: string } }>; terminate: () => Promise<unknown> } | null = null;
    let stream: MediaStream | null = null;
    let timer: number | null = null;
    let busy = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("loading-model");

        const { createWorker } = await import("tesseract.js");
        if (cancelled) return;
        worker = await createWorker("eng");
        if (cancelled) return;
        setStatus("scanning");

        const scanOnce = async () => {
          if (cancelled || busy || !videoRef.current || !worker) return;
          const v = videoRef.current;
          if (v.videoWidth === 0 || v.videoHeight === 0) return;
          busy = true;
          try {
            const canvas = document.createElement("canvas");
            const targetW = Math.min(v.videoWidth, 960);
            const scale = targetW / v.videoWidth;
            canvas.width = targetW;
            canvas.height = Math.round(v.videoHeight * scale);
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const { data } = await worker.recognize(canvas);
            if (cancelled) return;
            setLastText(data.text.slice(0, 80));
            const hit = containsAny(data.text, targets);
            if (hit) {
              setStatus("matched");
              if (timer) window.clearInterval(timer);
              setTimeout(() => {
                if (!cancelled) onMatch();
              }, 600);
            }
          } finally {
            busy = false;
          }
        };

        timer = window.setInterval(scanOnce, 1500);
      } catch (err) {
        if (cancelled) return;
        console.error("TextScanner error", err);
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      if (worker) worker.terminate().catch(() => {});
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [targets.join("|")]);

  return (
    <div class="scanner">
      <video ref={videoRef} class="scanner-video" playsInline muted />
      <div class="scanner-overlay">
        <div class="scanner-viewfinder" />
        <div class="scanner-prompt">
          <strong>{prompt}</strong>
          {status === "loading-camera" && <p>Starting camera…</p>}
          {status === "loading-model" && <p>Loading text reader…</p>}
          {status === "scanning" && <p>Scanning for text… {lastText && <em>Sees: "{lastText}"</em>}</p>}
          {status === "matched" && <p class="scanner-matched">Found it!</p>}
          {status === "error" && (
            <p class="scanner-error">Camera unavailable: {errorMsg}</p>
          )}
          {hintText && status === "scanning" && <p class="scanner-hint">Hint: {hintText}</p>}
        </div>
        <div class="scanner-actions">
          <button class="btn" onClick={onCancel}>Back</button>
        </div>
      </div>
    </div>
  );
}

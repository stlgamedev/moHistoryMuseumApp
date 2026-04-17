import { useEffect, useRef, useState } from "preact/hooks";
import {
  classifyCameraError,
  forceClassicThisSession,
  noteCameraError,
  type CameraErrorKind,
} from "../state/capabilities";
import { ScannerError } from "./ScannerError";

interface Props {
  classes: string[];
  prompt: string;
  hintText?: string;
  minConfidence?: number;
  onMatch: () => void;
  onCancel: () => void;
  onFallbackToClassic: () => void;
}

type Status = "loading-camera" | "loading-model" | "scanning" | "matched" | "error";

interface Prediction {
  className: string;
  probability: number;
}

interface LoadedMobileNet {
  classify: (v: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => Promise<Prediction[]>;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function classHit(className: string, targets: string[]): string | null {
  const parts = className.split(",").map((p) => normalize(p));
  for (const target of targets) {
    const t = normalize(target);
    for (const part of parts) {
      if (part.includes(t) || t.includes(part)) return target;
    }
  }
  return null;
}

export function ObjectScanner({
  classes,
  prompt,
  hintText,
  minConfidence = 0.15,
  onMatch,
  onCancel,
  onFallbackToClassic,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<Status>("loading-camera");
  const [topGuess, setTopGuess] = useState<Prediction | null>(null);
  const [errorKind, setErrorKind] = useState<CameraErrorKind>("other");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let model: LoadedMobileNet | null = null;
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

        await import("@tensorflow/tfjs");
        if (cancelled) return;
        const mobilenet = await import("@tensorflow-models/mobilenet");
        if (cancelled) return;
        model = (await mobilenet.load({ version: 2, alpha: 0.5 })) as unknown as LoadedMobileNet;
        if (cancelled) return;
        setStatus("scanning");

        const scanOnce = async () => {
          if (cancelled || busy || !videoRef.current || !model) return;
          const v = videoRef.current;
          if (v.videoWidth === 0) return;
          busy = true;
          try {
            const preds = await model.classify(v);
            if (cancelled) return;
            setTopGuess(preds[0] ?? null);
            for (const p of preds) {
              if (p.probability < minConfidence) continue;
              const hit = classHit(p.className, classes);
              if (hit) {
                setStatus("matched");
                if (timer) window.clearInterval(timer);
                setTimeout(() => {
                  if (!cancelled) onMatch();
                }, 600);
                return;
              }
            }
          } finally {
            busy = false;
          }
        };

        timer = window.setInterval(scanOnce, 500);
      } catch (err) {
        if (cancelled) return;
        console.error("ObjectScanner error", err);
        const kind = classifyCameraError(err);
        noteCameraError(kind);
        setErrorKind(kind);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [classes.join("|"), retry]);

  if (status === "error") {
    return (
      <ScannerError
        kind={errorKind}
        onUseClassic={() => {
          forceClassicThisSession(errorKind);
          onFallbackToClassic();
        }}
        onRetry={() => {
          setStatus("loading-camera");
          setRetry((n) => n + 1);
        }}
        onCancel={onCancel}
      />
    );
  }

  const confidencePct = topGuess ? Math.round(topGuess.probability * 100) : 0;

  return (
    <div class="scanner">
      <video ref={videoRef} class="scanner-video" playsInline muted />
      <div class="scanner-overlay">
        <div class="scanner-viewfinder" />
        <div class="scanner-prompt">
          <strong>{prompt}</strong>
          {status === "loading-camera" && <p>Starting camera…</p>}
          {status === "loading-model" && <p>Loading object recognizer…</p>}
          {status === "scanning" && topGuess && (
            <p>I see: <em>{topGuess.className.split(",")[0]}</em> ({confidencePct}%)</p>
          )}
          {status === "scanning" && !topGuess && <p>Looking…</p>}
          {status === "matched" && <p class="scanner-matched">Found it!</p>}
          {hintText && status === "scanning" && <p class="scanner-hint">Hint: {hintText}</p>}
        </div>
        <div class="scanner-actions">
          <button class="btn" onClick={onCancel}>Back</button>
        </div>
      </div>
    </div>
  );
}

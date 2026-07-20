import { useEffect, useRef, useState } from "preact/hooks";
import {
  classifyCameraError,
  forceClassicThisSession,
  noteCameraError,
  type CameraErrorKind,
} from "../state/capabilities";
import { ScannerError } from "./ScannerError";

interface Props {
  refImage: string;          // URL of the reference image to match against
  prompt: string;
  hintText?: string;
  minSimilarity?: number;    // cosine-similarity threshold to count as a match
  onMatch: () => void;
  onCancel: () => void;
  onFallbackToClassic: () => void;
}

type Status = "loading-camera" | "loading-model" | "loading-ref" | "scanning" | "matched" | "error";

// MobileNet exposes `infer(input, embedding=true)` which returns the penultimate
// feature vector — we compare the live frame's vector to the reference image's
// vector with cosine similarity. Same model for both, so the space is shared.
interface EmbedTensor {
  data: () => Promise<Float32Array>;
  dispose: () => void;
}
interface LoadedMobileNet {
  infer: (input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, embedding: boolean) => EmbedTensor;
}

function toUnit(v: Float32Array): Float32Array {
  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm) || 1;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / norm;
  return out;
}

function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function embed(model: LoadedMobileNet, input: HTMLVideoElement | HTMLImageElement): Promise<Float32Array> {
  const t = model.infer(input, true);
  try {
    return toUnit(await t.data());
  } finally {
    t.dispose();
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load reference image: ${src}`));
    img.src = src;
  });
}

export function ImageScanner({
  refImage,
  prompt,
  hintText,
  minSimilarity = 0.6,
  onMatch,
  onCancel,
  onFallbackToClassic,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<Status>("loading-camera");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [errorKind, setErrorKind] = useState<CameraErrorKind>("other");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let model: LoadedMobileNet | null = null;
    let stream: MediaStream | null = null;
    let timer: number | null = null;
    let busy = false;
    let refVec: Float32Array | null = null;

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

        setStatus("loading-ref");
        const refImg = await loadImage(refImage);
        if (cancelled) return;
        refVec = await embed(model, refImg);
        if (cancelled) return;
        setStatus("scanning");

        const scanOnce = async () => {
          if (cancelled || busy || !videoRef.current || !model || !refVec) return;
          const v = videoRef.current;
          if (v.videoWidth === 0) return;
          busy = true;
          try {
            const frameVec = await embed(model, v);
            if (cancelled) return;
            const sim = dot(refVec, frameVec);
            setSimilarity(sim);
            if (sim >= minSimilarity) {
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

        timer = window.setInterval(scanOnce, 500);
      } catch (err) {
        if (cancelled) return;
        console.error("ImageScanner error", err);
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
  }, [refImage, minSimilarity, retry]);

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

  const simPct = similarity === null ? null : Math.round(similarity * 100);

  return (
    <div class="scanner">
      <video ref={videoRef} class="scanner-video" playsInline muted />
      <div class="scanner-overlay">
        <div class="scanner-viewfinder" />
        <div class="scanner-prompt">
          <strong>{prompt}</strong>
          {status === "loading-camera" && <p>Starting camera…</p>}
          {status === "loading-model" && <p>Loading image matcher…</p>}
          {status === "loading-ref" && <p>Preparing reference image…</p>}
          {status === "scanning" && (
            <p>Match: <em>{simPct ?? 0}%</em> (need {Math.round(minSimilarity * 100)}%)</p>
          )}
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

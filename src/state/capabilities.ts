import { signal } from "@preact/signals";

export type CameraErrorKind =
  | "permission-denied"
  | "no-device"
  | "in-use"
  | "other";

export interface Capabilities {
  cameraApiAvailable: boolean;
  cameraKnownBad: boolean;
  lastError?: CameraErrorKind;
}

export const capabilities = signal<Capabilities>({
  cameraApiAvailable: true,
  cameraKnownBad: false,
});

export function probeCameraCapability(): void {
  const available =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function";
  capabilities.value = { ...capabilities.value, cameraApiAvailable: available };
}

export function classifyCameraError(err: unknown): CameraErrorKind {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "permission-denied";
      case "NotFoundError":
      case "OverconstrainedError":
        return "no-device";
      case "NotReadableError":
      case "AbortError":
        return "in-use";
    }
  }
  return "other";
}

export function noteCameraError(kind: CameraErrorKind): void {
  capabilities.value = { ...capabilities.value, lastError: kind };
}

export function forceClassicThisSession(kind?: CameraErrorKind): void {
  capabilities.value = {
    ...capabilities.value,
    cameraKnownBad: true,
    lastError: kind ?? capabilities.value.lastError,
  };
}

export function clearCameraError(): void {
  capabilities.value = {
    cameraApiAvailable: capabilities.value.cameraApiAvailable,
    cameraKnownBad: false,
  };
}

export function scanBlocked(): boolean {
  return !capabilities.value.cameraApiAvailable || capabilities.value.cameraKnownBad;
}

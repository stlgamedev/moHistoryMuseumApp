import { useRef, useState } from "preact/hooks";

interface Props {
  label?: string;
  onCapture: (dataUrl: string) => void;
}

// Simple camera stub using the native file input with capture attribute.
// Works on iOS Safari and Android Chrome — opens the camera directly.
// A future version can swap in getUserMedia/<video> + QR detection.
export function CameraCapture({ label = "Take photo", onCapture }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(ev: Event) {
    const input = ev.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setPreview(url);
      onCapture(url);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div class="camera-capture">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        hidden
      />
      <button class="btn" onClick={() => inputRef.current?.click()}>
        {label}
      </button>
      {preview && <img class="camera-preview" src={preview} alt="" />}
    </div>
  );
}

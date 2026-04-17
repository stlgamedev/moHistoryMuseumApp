import { signal } from "@preact/signals";

export type Mode = "classic" | "scan";

export interface AppConfig {
  defaultMode: Mode;
}

const DEFAULT_CONFIG: AppConfig = { defaultMode: "classic" };

export const config = signal<AppConfig>(DEFAULT_CONFIG);

export async function loadConfig(): Promise<void> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}config.json`);
    if (!res.ok) return;
    const data = (await res.json()) as AppConfig;
    if (data.defaultMode === "classic" || data.defaultMode === "scan") {
      config.value = data;
    }
  } catch {
    // fall back to DEFAULT_CONFIG
  }
}

export type AgeTier = "youth" | "teen" | "adult";

export const AGE_TIERS: AgeTier[] = ["youth", "teen", "adult"];

export const AGE_TIER_LABELS: Record<AgeTier, string> = {
  youth: "Youth",
  teen: "Teen",
  adult: "Adult",
};

export interface AgeRange {
  min: number;
  max: number;
}

export const AGE_TIER_RANGES: Record<AgeTier, AgeRange> = {
  youth: { min: 3, max: 12 },
  teen: { min: 13, max: 17 },
  adult: { min: 18, max: 200 },
};

export interface MultiChoiceOption {
  label: string;
  image?: string;
  correct?: boolean;
}

export type ScanVerification =
  | { kind: "ocr"; anyOf: string[] }
  | { kind: "object"; classes: string[] };

export interface ScanBlock {
  prompt: string;
  verification: ScanVerification;
  hintText?: string;
  minConfidence?: number;
}

export type QuestionVariant =
  | {
      type: "multi-image";
      ageTier: AgeTier;
      prompt: string;
      choices: MultiChoiceOption[];
      scan?: ScanBlock;
    }
  | {
      type: "multi-text";
      ageTier: AgeTier;
      prompt: string;
      choices: MultiChoiceOption[];
      scan?: ScanBlock;
    }
  | {
      type: "fill-blank";
      ageTier: AgeTier;
      prompt: string;
      answer: string;
      acceptableAnswers?: string[];
      scan?: ScanBlock;
    };

export interface Question {
  id: string;
  topic?: string;
  hintImage?: string;
  hintText?: string;
  variants: QuestionVariant[];
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  patchImage: string;
  patchName?: string;
  questions: Question[];
}

export interface SectionIndex {
  sections: Array<{ id: string; path: string }>;
}

export type AgeTier = "3-5" | "5-10" | "10-15" | "15-20";

export const AGE_TIERS: AgeTier[] = ["3-5", "5-10", "10-15", "15-20"];

export interface AgeRange {
  min: number;
  max: number;
}

export const AGE_TIER_RANGES: Record<AgeTier, AgeRange> = {
  "3-5": { min: 3, max: 5 },
  "5-10": { min: 5, max: 10 },
  "10-15": { min: 10, max: 15 },
  "15-20": { min: 15, max: 20 },
};

export interface MultiChoiceOption {
  label: string;
  image?: string;
  correct?: boolean;
}

export type QuestionVariant =
  | {
      type: "multi-image";
      ageTier: AgeTier;
      prompt: string;
      choices: MultiChoiceOption[];
    }
  | {
      type: "multi-text";
      ageTier: AgeTier;
      prompt: string;
      choices: MultiChoiceOption[];
    }
  | {
      type: "fill-blank";
      ageTier: AgeTier;
      prompt: string;
      answer: string;
      acceptableAnswers?: string[];
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

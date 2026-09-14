import type { AiEvaluation, QaDecision } from "../ai/types";

export type AiQaResult = {
  key: string;
  sourceText: string;
  targetText: string;

  decision: QaDecision;
  evaluation: AiEvaluation | null;
  error: string | null;
};

export type AiQaReport = {
  sourceLocale: string;
  targetLocale: string;
  model: string;
  generatedAt: string;

  summary: {
    passed: number;
    reviews: number;
    failures: number;
    errors: number;
  };

  results: AiQaResult[];
};

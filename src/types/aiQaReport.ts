import type { AiDecision, AiEvaluation } from "../ai/types";

export type AiQaResult = {
  key: string;
  sourceText: string;
  targetText: string;
  evaluation: AiEvaluation;
  finalDecision: AiDecision;
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
  };

  results: AiQaResult[];
};

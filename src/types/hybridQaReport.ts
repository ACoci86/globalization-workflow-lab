import type { AiEvaluation, QaDecision } from "../ai/types";

export type HybridDeterministicIssue = {
  check: string;
  severity: "warn" | "fail";
  message: string;
};

export type HybridQaResult = {
  key: string;
  sourceText: string;
  targetText: string | null;

  deterministicIssues: HybridDeterministicIssue[];

  aiUsed: boolean;
  aiEvaluation: AiEvaluation | null;

  decision: QaDecision;
  error: string | null;
};

export type HybridQaReport = {
  sourceLocale: string;
  targetLocale: string;
  provider: string;
  generatedAt: string;

  summary: {
    passed: number;
    reviews: number;
    failures: number;
    errors: number;
    aiEvaluated: number;
    aiSkipped: number;
  };

  results: HybridQaResult[];
};

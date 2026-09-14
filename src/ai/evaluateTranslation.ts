import { generate } from "./llmClient";
import { buildEvaluationPrompt } from "./buildEvaluationPrompt";
import type { AiEvaluation, AiIssue, AiIssueCategory } from "./types";

function stripFences(text: string): string {
  return text.replace(/```json|```/g, "").trim();
}

const VALID_CATEGORIES: AiIssueCategory[] = [
  "accuracy",
  "fluency",
  "style",
  "terminology",
  "other",
];

function isValidIssue(value: unknown): value is AiIssue {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const issue = value as Record<string, unknown>;

  return (
    typeof issue.category === "string" &&
    VALID_CATEGORIES.includes(issue.category as AiIssueCategory) &&
    typeof issue.description === "string" &&
    issue.description.trim().length > 0
  );
}

function isValidEvaluation(value: unknown): value is AiEvaluation {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const evaluation = value as Record<string, unknown>;

  const isValidScore = (value: unknown) =>
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5;

  return (
    isValidScore(evaluation.accuracy) &&
    isValidScore(evaluation.fluency) &&
    isValidScore(evaluation.style) &&
    Array.isArray(evaluation.issues) &&
    evaluation.issues.every(isValidIssue)
  );
}

export async function evaluateTranslation(
  sourceText: string,
  targetText: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<AiEvaluation> {
  const prompt = buildEvaluationPrompt(
    sourceText,
    targetText,
    sourceLocale,
    targetLocale,
  );

  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await generate(prompt);
      const parsed: unknown = JSON.parse(stripFences(raw));

      if (!isValidEvaluation(parsed)) {
        throw new Error(`Invalid AI evaluation shape: ${raw}`);
      }

      return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `AI evaluation failed after 2 attempts: ${String(lastError)}`,
  );
}

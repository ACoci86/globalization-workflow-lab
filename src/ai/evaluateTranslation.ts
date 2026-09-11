import { generate } from "./llmClient";
import { buildEvaluationPrompt } from "./buildEvaluationPrompt";
import type { AiEvaluation } from "./types";

function stripFences(text: string): string {
  return text.replace(/```json|```/g, "").trim();
}

function isValidEvaluation(value: unknown): value is AiEvaluation {
  if (typeof value !== "object" || value === null) return false;

  const v = value as Record<string, unknown>;
  const inRange = (n: unknown) => typeof n === "number" && n >= 1 && n <= 5;

  return (
    inRange(v.accuracy) &&
    inRange(v.fluency) &&
    inRange(v.style) &&
    typeof v.confidence === "number" &&
    v.confidence >= 0 &&
    v.confidence <= 1 &&
    Array.isArray(v.reasons)
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

      if (isValidEvaluation(parsed)) {
        return parsed;
      }

      lastError = new Error(`Invalid evaluation shape: ${raw}`);
    } catch (error) {
      lastError = error;
    }
  }

  // Two failures: hand it to a human rather than guess.
  return {
    accuracy: 3,
    fluency: 3,
    style: 3,
    confidence: 0,
    decision: "review",
    reasons: [`Model output could not be parsed: ${String(lastError)}`],
  };
}

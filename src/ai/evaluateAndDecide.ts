import { evaluateTranslation } from "./evaluateTranslation";
import { applyEvaluationPolicy } from "./applyEvaluationPolicy";
import type { AiEvaluation, QaDecision } from "./types";

export type AiQaResult =
  | {
      decision: Exclude<QaDecision, "error">;
      evaluation: AiEvaluation;
      error: null;
    }
  | {
      decision: "error";
      evaluation: null;
      error: string;
    };

export async function evaluateAndDecide(
  sourceText: string,
  targetText: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<AiQaResult> {
  try {
    const evaluation = await evaluateTranslation(
      sourceText,
      targetText,
      sourceLocale,
      targetLocale,
    );

    const decision = applyEvaluationPolicy(evaluation);

    return {
      decision,
      evaluation,
      error: null,
    };
  } catch (error) {
    return {
      decision: "error",
      evaluation: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

import { evaluateTranslation } from "./evaluateTranslation";
import { applyEvaluationPolicy } from "./applyEvaluationPolicy";
import type { AiEvaluation, AiDecision } from "./types";

export type EvaluationResult = {
  evaluation: AiEvaluation;
  finalDecision: AiDecision;
};

export async function evaluateAndDecide(
  sourceText: string,
  targetText: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<EvaluationResult> {
  const evaluation = await evaluateTranslation(
    sourceText,
    targetText,
    sourceLocale,
    targetLocale,
  );

  const finalDecision = applyEvaluationPolicy(evaluation);

  return {
    evaluation,
    finalDecision,
  };
}

import type { AiDecision, AiEvaluation } from "./types";

export function applyEvaluationPolicy(
  evaluation: AiEvaluation,
): AiDecision {
  if (evaluation.accuracy <= 2) {
    return "fail";
  }

  if (evaluation.accuracy === 3) {
    return "review";
  }

  if (evaluation.confidence < 0.8) {
    return "review";
  }

  if (evaluation.fluency <= 2 || evaluation.style <= 2) {
    return "review";
  }

  return "pass";
}

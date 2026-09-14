import type { AiEvaluation, QaDecision } from "./types";

export function applyEvaluationPolicy(
  evaluation: AiEvaluation,
): Exclude<QaDecision, "error"> {
  if (evaluation.accuracy <= 2) {
    return "fail";
  }

  if (evaluation.accuracy === 3) {
    return "review";
  }

  if (evaluation.fluency <= 2) {
    return "review";
  }

  if (evaluation.style <= 2) {
    return "review";
  }

  if (evaluation.issues.length > 0) {
    return "review";
  }

  return "pass";
}

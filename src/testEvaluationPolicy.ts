import { applyEvaluationPolicy } from "./ai/applyEvaluationPolicy";
import type { AiEvaluation } from "./ai/types";

const evaluation: AiEvaluation = {
  accuracy: 2,
  fluency: 4,
  style: 4,
  confidence: 0.9,

  // Pretend the AI made the wrong decision.
  decision: "review",

  reasons: [
    "Meaning is significantly different from the source.",
  ],
};

const finalDecision = applyEvaluationPolicy(evaluation);

console.log("AI decision:", evaluation.decision);
console.log("Workflow decision:", finalDecision);

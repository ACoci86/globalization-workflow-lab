export type AiDecision = "pass" | "review" | "fail";

export type AiEvaluation = {
  accuracy: number;
  fluency: number;
  style: number;
  confidence: number;
  decision: AiDecision;
  reasons: string[];
};

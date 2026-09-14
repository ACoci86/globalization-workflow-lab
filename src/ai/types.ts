export type QaDecision = "pass" | "review" | "fail" | "error";

export type AiIssueCategory =
  | "accuracy"
  | "fluency"
  | "style"
  | "terminology"
  | "other";

export type AiIssue = {
  category: AiIssueCategory;
  description: string;
};

export type AiEvaluation = {
  accuracy: number;
  fluency: number;
  style: number;
  issues: AiIssue[];
};

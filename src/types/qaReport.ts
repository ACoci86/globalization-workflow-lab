export type QaSeverity = "pass" | "warn" | "fail";

export type QaIssue = {
  key: string;
  check: string;
  severity: QaSeverity;
  message: string;
};

export type QaReport = {
  sourceLocale: string;
  targetLocale: string;
  generatedAt: string;

  summary: {
    passed: number;
    warnings: number;
    failures: number;
  };

  issues: QaIssue[];
};

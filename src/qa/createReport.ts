import type { QaIssue, QaReport } from "../types/qaReport";

export function createReport(
  sourceLocale: string,
  targetLocale: string,
  issues: QaIssue[],
): QaReport {
  const passed = issues.filter(
    (issue) => issue.severity === "pass",
  ).length;

  const warnings = issues.filter(
    (issue) => issue.severity === "warn",
  ).length;

  const failures = issues.filter(
    (issue) => issue.severity === "fail",
  ).length;

  return {
    sourceLocale,
    targetLocale,
    generatedAt: new Date().toISOString(),

    summary: {
      passed,
      warnings,
      failures,
    },

    issues,
  };
}

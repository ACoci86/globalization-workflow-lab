import type { BenchmarkEntry } from "./benchmark";
import type { TerminologyEntry } from "../qa/terminology";

import { comparePlaceholders } from "../qa/comparePlaceholders";
import { checkTerminology } from "../qa/checkTerminology";
import { checkProtectedTerms } from "../qa/checkProtectedTerms";
import { checkUntranslated } from "../qa/checkUntranslated";

export type BenchmarkEvaluation = {
  id: string;
  status: "pass" | "fail";
  issues: string[];
};

export function evaluateBenchmarkEntry(
  entry: BenchmarkEntry,
  terminology: TerminologyEntry[],
  protectedTerms: string[],
): BenchmarkEvaluation {
  const issues: string[] = [];

  const placeholders = comparePlaceholders(
    entry.source,
    entry.target,
  );

  if (placeholders.missing.length > 0) {
    issues.push("missing-placeholder");
  }

  const terminologyIssues = checkTerminology(
    entry.source,
    entry.target,
    terminology,
  );

  if (terminologyIssues.length > 0) {
    issues.push("terminology");
  }

  const protectedTermIssues = checkProtectedTerms(
    entry.source,
    entry.target,
    protectedTerms,
  );

  if (protectedTermIssues.length > 0) {
    issues.push("protected-term");
  }

  const isUntranslated = checkUntranslated(
    entry.source,
    entry.target,
  );

  const isProtectedOnly = protectedTerms.some(
    (term) =>
      entry.source.trim() === term &&
      entry.target.trim() === term,
  );

  if (isUntranslated && !isProtectedOnly) {
    issues.push("untranslated");
  }

  return {
    id: entry.id,
    status: issues.length > 0 ? "fail" : "pass",
    issues,
  };
}

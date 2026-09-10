import type { TerminologyEntry } from "./terminology";

export type TerminologyIssue = {
  sourceTerm: string;
  approvedTarget: string;
};

function containsWholeTerm(text: string, term: string): boolean {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pattern = new RegExp(`\\b${escapedTerm}\\b`, "i");

  return pattern.test(text);
}

export function checkTerminology(
  sourceText: string,
  targetText: string,
  terminology: TerminologyEntry[],
): TerminologyIssue[] {
  const issues: TerminologyIssue[] = [];

  for (const entry of terminology) {
    const sourceContainsTerm = containsWholeTerm(sourceText, entry.source);

    if (!sourceContainsTerm) {
      continue;
    }

    const targetContainsApprovedTerm = containsWholeTerm(
      targetText,
      entry.approvedTarget,
    );

    if (!targetContainsApprovedTerm) {
      issues.push({
        sourceTerm: entry.source,
        approvedTarget: entry.approvedTarget,
      });
    }
  }

  return issues;
}

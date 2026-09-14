import type { TerminologyEntry } from "./terminology";

export type TerminologyIssue = {
  sourceTerm: string;
  approvedTarget: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWholeTerm(text: string, term: string): boolean {
  const escaped = escapeRegExp(term);

  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
    "iu",
  );

  return pattern.test(text);
}

export function checkTerminology(
  sourceText: string,
  targetText: string,
  terminology: TerminologyEntry[],
): TerminologyIssue[] {
  const issues: TerminologyIssue[] = [];

  for (const entry of terminology) {
    /*
     * Advisory terminology is handled by the
     * linguistic AI evaluation layer.
     */
    if (entry.enforcement === "advisory") {
      continue;
    }

    /*
     * Match complete terminology entries rather than
     * substrings.
     *
     * Example:
     * "threat" must not match inside "threats".
     */
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

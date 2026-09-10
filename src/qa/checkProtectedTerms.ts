export function checkProtectedTerms(
  sourceText: string,
  targetText: string,
  protectedTerms: string[]
): string[] {
  const issues: string[] = [];

  for (const term of protectedTerms) {
    const sourceContainsTerm = sourceText.includes(term);
    const targetContainsTerm = targetText.includes(term);

    if (sourceContainsTerm && !targetContainsTerm) {
      issues.push(term);
    }
  }

  return issues;
}

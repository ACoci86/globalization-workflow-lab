export type LengthIssue = {
  sourceLength: number;
  targetLength: number;
  ratio: number;
};

export function checkLength(
  sourceText: string,
  targetText: string,
  maxLengthRatio: number,
): LengthIssue | null {
  if (sourceText.length === 0) {
    return null;
  }

  const ratio = targetText.length / sourceText.length;

  if (ratio > maxLengthRatio) {
    return {
      sourceLength: sourceText.length,
      targetLength: targetText.length,
      ratio,
    };
  }

  return null;
}

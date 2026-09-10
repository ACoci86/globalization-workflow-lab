export function checkUntranslated(
  sourceText: string,
  targetText: string,
): boolean {
  const source = sourceText.trim().toLowerCase();
  const target = targetText.trim().toLowerCase();

  if (source.length === 0 || target.length === 0) {
    return false;
  }

  return source === target;
}

import type { TranslationMemoryEntry } from "./translationMemory";

export function findTranslationMemoryMatch(
  sourceText: string,
  sourceLocale: string,
  targetLocale: string,
  translationMemory: TranslationMemoryEntry[],
): TranslationMemoryEntry | null {
  const match = translationMemory.find(
    (entry) =>
      entry.source === sourceText &&
      entry.sourceLocale === sourceLocale &&
      entry.targetLocale === targetLocale,
  );

  return match ?? null;
}

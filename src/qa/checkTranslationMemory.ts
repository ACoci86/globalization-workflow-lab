import type { TranslationMemoryEntry } from "./translationMemory";
import { findTranslationMemoryMatch } from "./findTranslationMemoryMatch";

export type TranslationMemoryIssue = {
  expectedTarget: string;
  actualTarget: string;
};

export function checkTranslationMemory(
  sourceText: string,
  targetText: string,
  sourceLocale: string,
  targetLocale: string,
  translationMemory: TranslationMemoryEntry[],
): TranslationMemoryIssue | null {
  const match = findTranslationMemoryMatch(
    sourceText,
    sourceLocale,
    targetLocale,
    translationMemory,
  );

  if (!match) {
    return null;
  }

  if (match.target === targetText) {
    return null;
  }

  return {
    expectedTarget: match.target,
    actualTarget: targetText,
  };
}

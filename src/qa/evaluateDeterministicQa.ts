import { comparePlaceholders } from "./comparePlaceholders";
import { checkTerminology } from "./checkTerminology";
import { checkProtectedTerms } from "./checkProtectedTerms";
import { checkUntranslated } from "./checkUntranslated";
import { checkLength } from "./checkLength";
import { checkTranslationMemory } from "./checkTranslationMemory";

import type { TerminologyEntry } from "./terminology";
import type { TranslationMemoryEntry } from "./translationMemory";

export type DeterministicIssue = {
  check:
    | "placeholders"
    | "terminology"
    | "protectedTerms"
    | "untranslated"
    | "translationMemory"
    | "length";

  severity: "warn" | "fail";
  message: string;
};

export type DeterministicQaResult = {
  passedBlockingChecks: boolean;
  issues: DeterministicIssue[];
};

type LanguageRules = {
  protectedTerms: string[];
  maxLengthRatio: number;
};

export function evaluateDeterministicQa(
  sourceText: string,
  targetText: string,
  sourceLocale: string,
  targetLocale: string,
  terminology: TerminologyEntry[],
  rules: LanguageRules,
  translationMemory: TranslationMemoryEntry[],
): DeterministicQaResult {
  const issues: DeterministicIssue[] = [];

  const placeholders = comparePlaceholders(
    sourceText,
    targetText,
  );

  for (const placeholder of placeholders.missing) {
    issues.push({
      check: "placeholders",
      severity: "fail",
      message: `Missing placeholder ${placeholder}`,
    });
  }

  for (const placeholder of placeholders.extra) {
    issues.push({
      check: "placeholders",
      severity: "fail",
      message: `Extra placeholder ${placeholder}`,
    });
  }

  const terminologyIssues = checkTerminology(
    sourceText,
    targetText,
    terminology,
  );

  for (const issue of terminologyIssues) {
    issues.push({
      check: "terminology",
      severity: "fail",
      message: `Expected "${issue.approvedTarget}" for "${issue.sourceTerm}"`,
    });
  }

  const protectedTermIssues = checkProtectedTerms(
    sourceText,
    targetText,
    rules.protectedTerms,
  );

  for (const term of protectedTermIssues) {
    issues.push({
      check: "protectedTerms",
      severity: "fail",
      message: `Protected term changed: ${term}`,
    });
  }

  const isProtectedOnly = rules.protectedTerms.some(
    (term) =>
      sourceText.trim() === term &&
      targetText.trim() === term,
  );

  if (
    checkUntranslated(sourceText, targetText) &&
    !isProtectedOnly
  ) {
    issues.push({
      check: "untranslated",
      severity: "fail",
      message: "Target appears to be untranslated",
    });
  }

  const translationMemoryIssue = checkTranslationMemory(
    sourceText,
    targetText,
    sourceLocale,
    targetLocale,
    translationMemory,
  );

  if (translationMemoryIssue) {
    issues.push({
      check: "translationMemory",
      severity: "warn",
      message:
        `Target differs from translation memory: expected ` +
        `"${translationMemoryIssue.expectedTarget}"`,
    });
  }

  const lengthIssue = checkLength(
    sourceText,
    targetText,
    rules.maxLengthRatio,
  );

  if (lengthIssue) {
    issues.push({
      check: "length",
      severity: "warn",
      message:
        `Target is ${lengthIssue.ratio.toFixed(2)}x ` +
        `the source length`,
    });
  }

  const passedBlockingChecks = !issues.some(
    (issue) => issue.severity === "fail",
  );

  return {
    passedBlockingChecks,
    issues,
  };
}

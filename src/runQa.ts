import fs from "node:fs";
import path from "node:path";

import { loadTerminology } from "./qa/terminology";
import { loadTranslationMemory } from "./qa/translationMemory";
import { checkKeys } from "./qa/checkKeys";
import { evaluateDeterministicQa } from "./qa/evaluateDeterministicQa";

import type { QaIssue } from "./types/qaReport";
import { createReport } from "./qa/createReport";
import { writeReport } from "./qa/writeReport";

const sourceLocale = "en-US";
const targetLocale = "it-IT";

const sourcePath = path.join("samples", "source", `${sourceLocale}.json`);

const targetPath = path.join("samples", "target", `${targetLocale}.json`);

const terminologyPath = path.join(
  "language-assets",
  targetLocale,
  "terminology.csv",
);

const rulesPath = path.join(
  "language-assets",
  targetLocale,
  "language-rules.json",
);

const translationMemoryPath = path.join(
  "language-assets",
  "translation-memory",
  `${sourceLocale}_${targetLocale}.json`,
);

const reportPath = path.join("reports", "qa-report.json");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf-8")) as Record<
  string,
  string
>;

const target = JSON.parse(fs.readFileSync(targetPath, "utf-8")) as Record<
  string,
  string
>;

const terminology = loadTerminology(terminologyPath);

const rules = JSON.parse(fs.readFileSync(rulesPath, "utf-8")) as {
  locale: string;
  protectedTerms: string[];
  maxLengthRatio: number;
};

const translationMemory = loadTranslationMemory(translationMemoryPath);

const issues: QaIssue[] = [];

const keyIssues = checkKeys(source, target);

/*
 * Extra keys exist in the target but not in the source.
 */
for (const key of keyIssues.extraInTarget) {
  const message = "Extra target key not found in source";

  console.log(`WARN [${key}]: ${message}`);

  issues.push({
    key,
    check: "keys",
    severity: "warn",
    message,
  });
}

/*
 * Evaluate every source string independently.
 */
for (const [key, sourceText] of Object.entries(source)) {
  const targetText = target[key];

  /*
   * A missing translation is an immediate deterministic failure.
   */
  if (targetText === undefined) {
    const message = "Translation key is missing";

    console.log(`FAIL [${key}]: ${message}`);

    issues.push({
      key,
      check: "keys",
      severity: "fail",
      message,
    });

    continue;
  }

  const result = evaluateDeterministicQa(
    sourceText,
    targetText,
    sourceLocale,
    targetLocale,
    terminology,
    rules,
    translationMemory,
  );

  /*
   * Store and print every issue found for this string.
   */
  for (const issue of result.issues) {
    console.log(`${issue.severity.toUpperCase()} [${key}]: ${issue.message}`);

    issues.push({
      key,
      check: issue.check,
      severity: issue.severity,
      message: issue.message,
    });
  }

  /*
   * A string passes deterministic QA when no blocking
   * deterministic check failed.
   *
   * Warnings such as length or TM differences do not block it.
   */
  if (result.passedBlockingChecks) {
    console.log(`PASS [${key}]`);

    issues.push({
      key,
      check: "overall",
      severity: "pass",
      message: "All blocking deterministic QA checks passed",
    });
  }
}

const report = createReport(sourceLocale, targetLocale, issues);

writeReport(report, reportPath);

console.log("");
console.log(`QA report written to ${reportPath}`);

console.log(
  `Summary: ${report.summary.passed} passed, ` +
    `${report.summary.warnings} warnings, ` +
    `${report.summary.failures} failures`,
);

if (report.summary.failures > 0) {
  process.exitCode = 1;
}

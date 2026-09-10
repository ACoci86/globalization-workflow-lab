import fs from "node:fs";
import path from "node:path";

import { comparePlaceholders } from "./qa/comparePlaceholders";
import { loadTerminology } from "./qa/terminology";
import { checkTerminology } from "./qa/checkTerminology";
import { checkProtectedTerms } from "./qa/checkProtectedTerms";
import { checkLength } from "./qa/checkLength";
import { checkKeys } from "./qa/checkKeys";
import { checkUntranslated } from "./qa/checkUntranslated";

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

let hasErrors = false;

const issues: QaIssue[] = [];

//
// Key checks
//

const keyIssues = checkKeys(source, target);

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

//
// String-level checks
//

for (const [key, sourceText] of Object.entries(source)) {
  const targetText = target[key];

  //
  // Missing translation
  //

  if (targetText === undefined) {
    const message = "Translation key is missing";

    console.log(`FAIL [${key}]: ${message}`);

    issues.push({
      key,
      check: "keys",
      severity: "fail",
      message,
    });

    hasErrors = true;
    continue;
  }

  //
  // Placeholder checks
  //

  const placeholders = comparePlaceholders(sourceText, targetText);

  if (placeholders.missing.length > 0) {
    const message = `Missing placeholder ${placeholders.missing.join(", ")}`;

    console.log(`FAIL [${key}]: ${message}`);

    issues.push({
      key,
      check: "placeholders",
      severity: "fail",
      message,
    });

    hasErrors = true;
  }

  if (placeholders.extra.length > 0) {
    const message = `Extra placeholder ${placeholders.extra.join(", ")}`;

    console.log(`FAIL [${key}]: ${message}`);

    issues.push({
      key,
      check: "placeholders",
      severity: "fail",
      message,
    });

    hasErrors = true;
  }

  //
  // Terminology checks
  //

  const terminologyIssues = checkTerminology(
    sourceText,
    targetText,
    terminology,
  );

  for (const issue of terminologyIssues) {
    const message = `Expected "${issue.approvedTarget}" for "${issue.sourceTerm}"`;

    console.log(`FAIL [${key}]: ${message}`);

    issues.push({
      key,
      check: "terminology",
      severity: "fail",
      message,
    });

    hasErrors = true;
  }

  //
  // Protected-term checks
  //

  const protectedTermIssues = checkProtectedTerms(
    sourceText,
    targetText,
    rules.protectedTerms,
  );

  for (const term of protectedTermIssues) {
    const message = `Protected term changed: ${term}`;

    console.log(`FAIL [${key}]: ${message}`);

    issues.push({
      key,
      check: "protectedTerms",
      severity: "fail",
      message,
    });

    hasErrors = true;
  }

  //
  // Untranslated-string check
  //

  const isUntranslated = checkUntranslated(sourceText, targetText);

  const isProtectedOnly = rules.protectedTerms.some(
    (term) => sourceText.trim() === term && targetText.trim() === term,
  );

  if (isUntranslated && !isProtectedOnly) {
    const message = "Target appears to be untranslated";

    console.log(`FAIL [${key}]: ${message}`);

    issues.push({
      key,
      check: "untranslated",
      severity: "fail",
      message,
    });

    hasErrors = true;
  }

  //
  // Length check
  //

  const lengthIssue = checkLength(sourceText, targetText, rules.maxLengthRatio);

  if (lengthIssue) {
    const message = `Target is ${lengthIssue.ratio.toFixed(2)}x the source length`;

    console.log(`WARN [${key}]: ${message}`);

    issues.push({
      key,
      check: "length",
      severity: "warn",
      message,
    });
  }

  //
  // Overall pass for this string
  //

  const stringHasFailures =
    placeholders.missing.length > 0 ||
    placeholders.extra.length > 0 ||
    terminologyIssues.length > 0 ||
    protectedTermIssues.length > 0 ||
    (isUntranslated && !isProtectedOnly);

  if (!stringHasFailures) {
    console.log(`PASS [${key}]`);

    issues.push({
      key,
      check: "overall",
      severity: "pass",
      message: "All blocking QA checks passed",
    });
  }
}

//
// Build and save report
//

const report = createReport(sourceLocale, targetLocale, issues);

writeReport(report, reportPath);

console.log("");
console.log(`QA report written to ${reportPath}`);
console.log(
  `Summary: ${report.summary.passed} passed, ` +
    `${report.summary.warnings} warnings, ` +
    `${report.summary.failures} failures`,
);

//
// CI exit status
//

if (hasErrors) {
  process.exit(1);
}

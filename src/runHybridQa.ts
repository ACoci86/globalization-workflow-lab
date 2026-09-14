import fs from "node:fs";
import path from "node:path";

import { loadTerminology } from "./qa/terminology";
import { loadTranslationMemory } from "./qa/translationMemory";
import { evaluateDeterministicQa } from "./qa/evaluateDeterministicQa";

import { evaluateAndDecide } from "./ai/evaluateAndDecide";

import type { HybridQaReport, HybridQaResult } from "./types/hybridQaReport";

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

async function main() {
  const results: HybridQaResult[] = [];

  for (const [key, sourceText] of Object.entries(source)) {
    const targetText = target[key];

    console.log("");
    console.log(`Checking [${key}]`);

    /*
     * Missing target = immediate deterministic failure.
     */
    if (targetText === undefined) {
      console.log("FAIL: Translation key is missing");
      console.log("AI skipped");

      results.push({
        key,
        sourceText,
        targetText: null,

        deterministicIssues: [
          {
            check: "keys",
            severity: "fail",
            message: "Translation key is missing",
          },
        ],

        aiUsed: false,
        aiEvaluation: null,

        decision: "fail",
        error: null,
      });

      continue;
    }

    /*
     * STEP 1:
     * Run deterministic QA first.
     */
    const deterministic = evaluateDeterministicQa(
      sourceText,
      targetText,
      sourceLocale,
      targetLocale,
      terminology,
      rules,
      translationMemory,
    );

    for (const issue of deterministic.issues) {
      console.log(`${issue.severity.toUpperCase()}: ${issue.message}`);
    }

    /*
     * If an objective deterministic check failed,
     * do not spend money calling an AI model.
     */
    if (!deterministic.passedBlockingChecks) {
      console.log("Final decision: FAIL");
      console.log("AI skipped");

      results.push({
        key,
        sourceText,
        targetText,

        deterministicIssues: deterministic.issues,

        aiUsed: false,
        aiEvaluation: null,

        decision: "fail",
        error: null,
      });

      continue;
    }

    /*
     * STEP 2:
     * Deterministic blocking checks passed.
     * Now use AI for linguistic judgement.
     */
    console.log("Deterministic blocking checks passed");
    console.log("Running AI linguistic QA...");

    const aiResult = await evaluateAndDecide(
      sourceText,
      targetText,
      sourceLocale,
      targetLocale,
    );

    /*
     * API/system failure is not a translation failure.
     */
    if (aiResult.decision === "error") {
      console.log(`ERROR: ${aiResult.error}`);

      results.push({
        key,
        sourceText,
        targetText,

        deterministicIssues: deterministic.issues,

        aiUsed: true,
        aiEvaluation: null,

        decision: "error",
        error: aiResult.error,
      });

      continue;
    }

    /*
     * Print AI evaluation.
     */
    console.log(
      `AI scores: accuracy=${aiResult.evaluation.accuracy}, ` +
        `fluency=${aiResult.evaluation.fluency}, ` +
        `style=${aiResult.evaluation.style}`,
    );

    for (const issue of aiResult.evaluation.issues) {
      console.log(`AI issue [${issue.category}]: ${issue.description}`);
    }

    /*
     * Deterministic warnings remain visible in the report,
     * but they do not automatically force human review.
     *
     * The AI policy decides PASS / REVIEW / FAIL.
     */
    const finalDecision = aiResult.decision;

    console.log(`Final decision: ${finalDecision.toUpperCase()}`);

    results.push({
      key,
      sourceText,
      targetText,

      deterministicIssues: deterministic.issues,

      aiUsed: true,
      aiEvaluation: aiResult.evaluation,

      decision: finalDecision,
      error: null,
    });
  }

  const provider = process.env.AI_PROVIDER ?? process.env.PROVIDER ?? "unknown";

  const report: HybridQaReport = {
    sourceLocale,
    targetLocale,
    provider,
    generatedAt: new Date().toISOString(),

    summary: {
      passed: results.filter((result) => result.decision === "pass").length,

      reviews: results.filter((result) => result.decision === "review").length,

      failures: results.filter((result) => result.decision === "fail").length,

      errors: results.filter((result) => result.decision === "error").length,

      aiEvaluated: results.filter((result) => result.aiUsed).length,

      aiSkipped: results.filter((result) => !result.aiUsed).length,
    },

    results,
  };

  const reportsDir = path.resolve("reports");

  fs.mkdirSync(reportsDir, {
    recursive: true,
  });

  const reportPath = path.join(
    reportsDir,
    `hybrid-qa-report-${Date.now()}.json`,
  );

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("");
  console.log("HYBRID QA SUMMARY");
  console.log("-----------------");
  console.log(`PASS: ${report.summary.passed}`);
  console.log(`REVIEW: ${report.summary.reviews}`);
  console.log(`FAIL: ${report.summary.failures}`);
  console.log(`ERROR: ${report.summary.errors}`);
  console.log(`AI evaluated: ${report.summary.aiEvaluated}`);
  console.log(`AI skipped: ${report.summary.aiSkipped}`);
  console.log(`Report: ${reportPath}`);

  if (
    report.summary.reviews > 0 ||
    report.summary.failures > 0 ||
    report.summary.errors > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import fs from "node:fs";
import path from "node:path";
import { evaluateAndDecide } from "./ai/evaluateAndDecide";
import type { AiQaReport } from "./types/aiQaReport";

const sourceLocale = "en-US";
const targetLocale = "it-IT";

const translationsPath = path.resolve("data", "translations.json");

const translations = JSON.parse(
  fs.readFileSync(translationsPath, "utf8"),
) as Record<string, { source: string; target: string }>;

async function main() {
  const results: AiQaReport["results"] = [];

  for (const [key, item] of Object.entries(translations)) {
    const result = await evaluateAndDecide(
      item.source,
      item.target,
      sourceLocale,
      targetLocale,
    );

    results.push({
      key,
      sourceText: item.source,
      targetText: item.target,
      decision: result.decision,
      evaluation: result.evaluation,
      error: result.error,
    });

    console.log(`\n${result.decision.toUpperCase()} [${key}]`);
    console.log(`Source: ${item.source}`);
    console.log(`Target: ${item.target}`);

    if (result.evaluation) {
      console.log(
        `Scores: accuracy=${result.evaluation.accuracy}, fluency=${result.evaluation.fluency}, style=${result.evaluation.style}`,
      );

      if (result.evaluation.issues.length > 0) {
        for (const issue of result.evaluation.issues) {
          console.log(`- ${issue.category}: ${issue.description}`);
        }
      }
    }

    if (result.error) {
      console.log(`ERROR: ${result.error}`);
    }
  }

  const report: AiQaReport = {
    sourceLocale,
    targetLocale,
    model: process.env.OPENAI_MODEL
      ? `openai/${process.env.OPENAI_MODEL}`
      : process.env.ANTHROPIC_MODEL
        ? `anthropic/${process.env.ANTHROPIC_MODEL}`
        : "unknown",
    generatedAt: new Date().toISOString(),

    summary: {
      passed: results.filter((r) => r.decision === "pass").length,
      reviews: results.filter((r) => r.decision === "review").length,
      failures: results.filter((r) => r.decision === "fail").length,
      errors: results.filter((r) => r.decision === "error").length,
    },

    results,
  };

  const reportsDir = path.resolve("reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const reportPath = path.join(reportsDir, `ai-qa-report-${Date.now()}.json`);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\nSummary");
  console.log(`PASS: ${report.summary.passed}`);
  console.log(`REVIEW: ${report.summary.reviews}`);
  console.log(`FAIL: ${report.summary.failures}`);
  console.log(`ERROR: ${report.summary.errors}`);
  console.log(`Report: ${reportPath}`);

  if (
    report.summary.failures > 0 ||
    report.summary.reviews > 0 ||
    report.summary.errors > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

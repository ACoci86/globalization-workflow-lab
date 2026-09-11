import fs from "node:fs";
import path from "node:path";

import { evaluateAndDecide } from "./ai/evaluateAndDecide";
import type { AiQaReport, AiQaResult } from "./types/aiQaReport";

async function main() {
  const sourceLocale = "en-US";
  const targetLocale = "it-IT";

  const source = JSON.parse(
    fs.readFileSync("samples/source/en-US.json", "utf-8"),
  ) as Record<string, string>;

  const target = JSON.parse(
    fs.readFileSync("samples/target/it-IT.json", "utf-8"),
  ) as Record<string, string>;

  const results: AiQaResult[] = [];
  let hasBlockingIssues = false;

  for (const [key, sourceText] of Object.entries(source)) {
    const targetText = target[key];

    if (targetText === undefined) {
      continue;
    }

    const result = await evaluateAndDecide(
      sourceText,
      targetText,
      sourceLocale,
      targetLocale,
    );

    console.log(`[${key}]`);
    console.log(result);
    console.log("");

    results.push({
      key,
      sourceText,
      targetText,
      evaluation: result.evaluation,
      finalDecision: result.finalDecision,
    });

    if (result.finalDecision !== "pass") {
      hasBlockingIssues = true;
    }
  }

  const report: AiQaReport = {
    sourceLocale,
    targetLocale,
    model: "qwen2.5:3b",
    generatedAt: new Date().toISOString(),

    summary: {
      passed: results.filter((result) => result.finalDecision === "pass")
        .length,
      reviews: results.filter((result) => result.finalDecision === "review")
        .length,
      failures: results.filter((result) => result.finalDecision === "fail")
        .length,
    },

    results,
  };

  const reportPath = path.join("reports", "ai-qa-report.json");

  fs.mkdirSync(path.dirname(reportPath), {
    recursive: true,
  });

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  console.log(`AI QA report written to ${reportPath}`);
  console.log(
    `Summary: ${report.summary.passed} passed, ` +
      `${report.summary.reviews} reviews, ` +
      `${report.summary.failures} failures`,
  );

  if (hasBlockingIssues) {
    console.log("AI QA requires review or contains failures.");
    process.exit(1);
  }

  console.log("AI QA passed.");
}

main();

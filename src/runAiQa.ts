import fs from "node:fs";
import path from "node:path";

import { evaluateAndDecide } from "./ai/evaluateAndDecide";
import { MODEL_LABEL, REQUEST_DELAY_MS, sleep } from "./ai/llmClient";
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

  console.log(`Model: ${MODEL_LABEL}`);
  console.log("");

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

    const { accuracy, fluency, style, confidence } = result.evaluation;

    console.log(
      `${result.finalDecision.toUpperCase().padEnd(6)} [${key}] ` +
        `acc=${accuracy} flu=${fluency} sty=${style} conf=${confidence}`,
    );

    for (const reason of result.evaluation.reasons) {
      console.log(`       - ${reason}`);
    }

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

    if (REQUEST_DELAY_MS > 0) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const report: AiQaReport = {
    sourceLocale,
    targetLocale,
    model: MODEL_LABEL,
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

  const modelSlug = MODEL_LABEL.replace(/[^a-zA-Z0-9.-]/g, "-");
  const reportPath = path.join("reports", `ai-qa-report.${modelSlug}.json`);

  fs.mkdirSync(path.dirname(reportPath), {
    recursive: true,
  });

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  console.log("");
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

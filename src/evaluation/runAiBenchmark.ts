import fs from "node:fs";
import path from "node:path";

import { evaluateAndDecide } from "../ai/evaluateAndDecide";

type ExpectedDecision = "pass" | "review" | "fail";

type AiBenchmarkEntry = {
  id: string;
  source: string;
  target: string;
  expectedDecision: ExpectedDecision;
  category: string;
};

const sourceLocale = "en-US";
const targetLocale = "it-IT";

const benchmarkPath = path.resolve("evaluation", "ai-benchmark.json");

const benchmark = JSON.parse(
  fs.readFileSync(benchmarkPath, "utf-8"),
) as AiBenchmarkEntry[];

async function main() {
  let correct = 0;
  let errors = 0;

  console.log("");
  console.log("AI LINGUISTIC QA BENCHMARK");
  console.log("--------------------------");

  for (const entry of benchmark) {
    const startedAt = Date.now();

    const result = await evaluateAndDecide(
      entry.source,
      entry.target,
      sourceLocale,
      targetLocale,
    );

    const durationMs = Date.now() - startedAt;

    if (result.decision === "error") {
      errors++;

      console.log(`ERROR ${entry.id}: ${result.error}`);

      console.log(`  duration: ${durationMs} ms`);

      continue;
    }

    const isCorrect = result.decision === entry.expectedDecision;

    if (isCorrect) {
      correct++;
    }

    const symbol = isCorrect ? "✓" : "✗";

    console.log(`${symbol} ${entry.id}`);

    console.log(`  expected: ${entry.expectedDecision}`);

    console.log(`  actual:   ${result.decision}`);

    console.log(
      `  scores: accuracy=${result.evaluation.accuracy}, ` +
        `fluency=${result.evaluation.fluency}, ` +
        `style=${result.evaluation.style}`,
    );

    console.log(`  duration: ${durationMs} ms`);

    if (result.evaluation.issues.length > 0) {
      for (const issue of result.evaluation.issues) {
        console.log(`  ${issue.category}: ${issue.description}`);
      }
    }
  }

  console.log("");
  console.log("BENCHMARK SUMMARY");
  console.log("-----------------");
  console.log(`Correct decisions: ${correct}/${benchmark.length}`);
  console.log(`Accuracy: ${((correct / benchmark.length) * 100).toFixed(1)}%`);
  console.log(`API/system errors: ${errors}`);

  if (correct !== benchmark.length || errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

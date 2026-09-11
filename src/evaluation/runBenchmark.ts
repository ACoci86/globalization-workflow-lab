import { loadBenchmark } from "./benchmark";
import { evaluateBenchmarkEntry } from "./evaluateBenchmarkEntry";

import { loadTerminology } from "../qa/terminology";

const benchmark = loadBenchmark(
  "evaluation/benchmark.json",
);

const terminology = loadTerminology(
  "language-assets/it-IT/terminology.csv",
);

const protectedTerms = [
  "Secure VPN",
];

let correct = 0;

for (const entry of benchmark) {
  const result = evaluateBenchmarkEntry(
    entry,
    terminology,
    protectedTerms,
  );

  const expectedIssue = entry.expected.issue;

  const issueMatches =
    expectedIssue === null
      ? result.issues.length === 0
      : result.issues.includes(expectedIssue);

  const statusMatches =
    result.status === entry.expected.status;

  const passed = issueMatches && statusMatches;

  if (passed) {
    correct++;
    console.log(`PASS [${entry.id}]`);
  } else {
    console.log(`FAIL [${entry.id}]`);
    console.log(
      `  expected: ${entry.expected.status} / ${entry.expected.issue}`,
    );
    console.log(
      `  actual:   ${result.status} / ${result.issues.join(", ")}`,
    );
  }
}

console.log("");
console.log(
  `Benchmark accuracy: ${correct}/${benchmark.length}`,
);

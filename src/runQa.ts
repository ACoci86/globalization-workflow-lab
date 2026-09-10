import fs from "node:fs";
import path from "node:path";

import { comparePlaceholders } from "./qa/comparePlaceholders";
import { loadTerminology } from "./qa/terminology";
import { checkTerminology } from "./qa/checkTerminology";

const sourcePath = path.join("samples", "source", "en-US.json");
const targetPath = path.join("samples", "target", "it-IT.json");

const terminologyPath = path.join(
  "language-assets",
  "it-IT",
  "terminology.csv",
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

let hasErrors = false;

for (const [key, sourceText] of Object.entries(source)) {
  const targetText = target[key];

  if (targetText === undefined) {
    console.log(`FAIL [${key}]: translation is missing`);
    hasErrors = true;
    continue;
  }

  const placeholders = comparePlaceholders(sourceText, targetText);

  if (placeholders.missing.length > 0) {
    console.log(
      `FAIL [${key}]: missing placeholder ${placeholders.missing.join(", ")}`,
    );
    hasErrors = true;
  }

  if (placeholders.extra.length > 0) {
    console.log(
      `FAIL [${key}]: extra placeholder ${placeholders.extra.join(", ")}`,
    );
    hasErrors = true;
  }

  const terminologyIssues = checkTerminology(
    sourceText,
    targetText,
    terminology,
  );

  for (const issue of terminologyIssues) {
    console.log(
      `FAIL [${key}]: expected "${issue.approvedTarget}" for "${issue.sourceTerm}"`,
    );
    hasErrors = true;
  }

  if (
    placeholders.missing.length === 0 &&
    placeholders.extra.length === 0 &&
    terminologyIssues.length === 0
  ) {
    console.log(`PASS [${key}]`);
  }
}

if (hasErrors) {
  process.exit(1);
}

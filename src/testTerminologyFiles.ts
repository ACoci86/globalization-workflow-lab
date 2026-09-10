import fs from "node:fs";
import path from "node:path";
import { loadTerminology } from "./qa/terminology";
import { checkTerminology } from "./qa/checkTerminology";

const sourcePath = path.join("samples", "source", "en-US.json");
const targetPath = path.join("samples", "target", "it-IT.json");

const terminologyPath = path.join(
  "language-assets",
  "it-IT",
  "terminology.csv"
);

const source = JSON.parse(
  fs.readFileSync(sourcePath, "utf-8")
) as Record<string, string>;

const target = JSON.parse(
  fs.readFileSync(targetPath, "utf-8")
) as Record<string, string>;

const terminology = loadTerminology(terminologyPath);

for (const [key, sourceText] of Object.entries(source)) {
  const targetText = target[key];

  if (targetText === undefined) {
    console.log(`FAIL [${key}]: translation is missing`);
    continue;
  }

  const issues = checkTerminology(
    sourceText,
    targetText,
    terminology
  );

  if (issues.length === 0) {
    console.log(`PASS [${key}]: terminology is correct`);
    continue;
  }

  for (const issue of issues) {
    console.log(
      `FAIL [${key}]: expected "${issue.approvedTarget}" for "${issue.sourceTerm}"`
    );
  }
}

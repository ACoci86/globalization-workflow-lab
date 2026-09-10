import fs from "node:fs";
import path from "node:path";
import { checkProtectedTerms } from "./qa/checkProtectedTerms";

const sourcePath = path.join("samples", "source", "en-US.json");
const targetPath = path.join("samples", "target", "it-IT.json");

const rulesPath = path.join(
  "language-assets",
  "it-IT",
  "language-rules.json"
);

const source = JSON.parse(
  fs.readFileSync(sourcePath, "utf-8")
) as Record<string, string>;

const target = JSON.parse(
  fs.readFileSync(targetPath, "utf-8")
) as Record<string, string>;

const rules = JSON.parse(
  fs.readFileSync(rulesPath, "utf-8")
) as {
  locale: string;
  protectedTerms: string[];
  maxLengthRatio: number;
};

for (const [key, sourceText] of Object.entries(source)) {
  const targetText = target[key];

  if (targetText === undefined) {
    continue;
  }

  const issues = checkProtectedTerms(
    sourceText,
    targetText,
    rules.protectedTerms
  );

  if (issues.length === 0) {
    console.log(`PASS [${key}]: protected terms`);
  } else {
    console.log(
      `FAIL [${key}]: protected term changed: ${issues.join(", ")}`
    );
  }
}

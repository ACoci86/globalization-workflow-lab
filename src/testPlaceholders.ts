import fs from "node:fs";
import path from "node:path";
import { comparePlaceholders } from "./qa/comparePlaceholders";

const sourcePath = path.join("samples", "source", "en-US.json");
const targetPath = path.join("samples", "target", "it-IT.json");

const source = JSON.parse(
  fs.readFileSync(sourcePath, "utf-8")
) as Record<string, string>;

const target = JSON.parse(
  fs.readFileSync(targetPath, "utf-8")
) as Record<string, string>;

for (const [key, sourceText] of Object.entries(source)) {
  const targetText = target[key];

  if (targetText === undefined) {
    console.log(`FAIL [${key}]: translation is missing`);
    continue;
  }

  const result = comparePlaceholders(sourceText, targetText);

  if (result.missing.length > 0) {
    console.log(
      `FAIL [${key}]: missing placeholder ${result.missing.join(", ")}`
    );
  }

  if (result.extra.length > 0) {
    console.log(
      `FAIL [${key}]: extra placeholder ${result.extra.join(", ")}`
    );
  }

  if (result.missing.length === 0 && result.extra.length === 0) {
    console.log(`PASS [${key}]: placeholders match`);
  }
}

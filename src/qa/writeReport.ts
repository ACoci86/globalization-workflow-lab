import fs from "node:fs";
import path from "node:path";

import type { QaReport } from "../types/qaReport";

export function writeReport(
  report: QaReport,
  outputPath: string,
): void {
  const directory = path.dirname(outputPath);

  fs.mkdirSync(directory, { recursive: true });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(report, null, 2),
    "utf-8",
  );
}

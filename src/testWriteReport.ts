import { createReport } from "./qa/createReport";
import { writeReport } from "./qa/writeReport";

const report = createReport(
  "en-US",
  "it-IT",
  [
    {
      key: "deviceProtection",
      check: "placeholders",
      severity: "fail",
      message: "Missing placeholder {count}",
    },
    {
      key: "scanComplete",
      check: "length",
      severity: "warn",
      message: "Target is 1.6x the source length",
    },
  ],
);

writeReport(report, "reports/qa-report.json");

console.log("Report written to reports/qa-report.json");

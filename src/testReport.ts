import { createReport } from "./qa/createReport";

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
    {
      key: "productName",
      check: "protectedTerms",
      severity: "pass",
      message: "Protected terms unchanged",
    },
  ],
);

console.log(JSON.stringify(report, null, 2));

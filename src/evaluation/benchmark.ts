import fs from "node:fs";

export type BenchmarkExpected = {
  status: "pass" | "fail";
  issue: string | null;
};

export type BenchmarkEntry = {
  id: string;
  source: string;
  target: string;
  sourceLocale: string;
  targetLocale: string;
  expected: BenchmarkExpected;
};

export function loadBenchmark(
  filePath: string,
): BenchmarkEntry[] {
  const content = fs.readFileSync(
    filePath,
    "utf-8",
  );

  return JSON.parse(content) as BenchmarkEntry[];
}

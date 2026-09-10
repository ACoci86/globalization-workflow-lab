import fs from "node:fs";

export type TerminologyEntry = {
  source: string;
  approvedTarget: string;
  notes: string;
};

export function loadTerminology(filePath: string): TerminologyEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");

  const lines = content.trim().split("\n");

  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const [source, approvedTarget, notes] = line.split(",");

    return {
      source,
      approvedTarget,
      notes
    };
  });
}

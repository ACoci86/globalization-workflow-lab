import fs from "node:fs";

export type TerminologyEnforcement = "strict" | "advisory";

export type TerminologyEntry = {
  source: string;
  approvedTarget: string;
  notes: string;
  enforcement: TerminologyEnforcement;
};

export function loadTerminology(filePath: string): TerminologyEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");

  const lines = content.trim().split("\n");

  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const [source, approvedTarget, notes, enforcementRaw] = line.split(",");

    const enforcement: TerminologyEnforcement =
      enforcementRaw?.trim() === "advisory" ? "advisory" : "strict";

    return {
      source: source.trim(),
      approvedTarget: approvedTarget.trim(),
      notes: notes?.trim() ?? "",
      enforcement,
    };
  });
}

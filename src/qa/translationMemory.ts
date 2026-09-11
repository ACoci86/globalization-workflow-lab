import fs from "node:fs";

export type TranslationMemoryEntry = {
  source: string;
  target: string;
  sourceLocale: string;
  targetLocale: string;
};

export function loadTranslationMemory(
  filePath: string,
): TranslationMemoryEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");

  return JSON.parse(content) as TranslationMemoryEntry[];
}

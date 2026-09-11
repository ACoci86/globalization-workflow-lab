import { generateWithOllama } from "./ollamaClient";
import { buildEvaluationPrompt } from "./buildEvaluationPrompt";
import type { AiEvaluation } from "./types";

export async function evaluateTranslation(
  sourceText: string,
  targetText: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<AiEvaluation> {
  const prompt = buildEvaluationPrompt(
    sourceText,
    targetText,
    sourceLocale,
    targetLocale,
  );

  const response = await generateWithOllama(prompt);

  return JSON.parse(response) as AiEvaluation;
}

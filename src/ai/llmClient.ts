import { generateWithOllama, OLLAMA_MODEL } from "./ollamaClient";
import { generateWithGemini, GEMINI_MODEL } from "./geminiClient";

export type Provider = "ollama" | "gemini";

export const PROVIDER: Provider =
  (process.env.PROVIDER as Provider | undefined) ?? "ollama";

export const MODEL_LABEL =
  PROVIDER === "gemini" ? `gemini/${GEMINI_MODEL}` : `ollama/${OLLAMA_MODEL}`;

export const REQUEST_DELAY_MS = Number(
  process.env.REQUEST_DELAY_MS ?? (PROVIDER === "gemini" ? 7000 : 0),
);

export async function generate(prompt: string): Promise<string> {
  if (PROVIDER === "gemini") {
    return generateWithGemini(prompt);
  }

  return generateWithOllama(prompt);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

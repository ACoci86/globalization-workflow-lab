import { generateWithAnthropic, ANTHROPIC_MODEL } from "./anthropicClient";
import { generateWithOllama, OLLAMA_MODEL } from "./ollamaClient";
import { generateWithOpenAI, OPENAI_MODEL } from "./openaiClient";

export type Provider = "ollama" | "openai" | "anthropic";

function providerFromArgs(): Provider | undefined {
  const value = process.argv
    .find((arg) => arg.startsWith("--provider="))
    ?.slice("--provider=".length);

  if (value === "openai" || value === "anthropic" || value === "ollama") {
    return value;
  }

  return undefined;
}

export const PROVIDER: Provider =
  providerFromArgs() ??
  (process.env.PROVIDER as Provider | undefined) ??
  "openai";

export const MODEL_LABEL =
  PROVIDER === "openai"
    ? `openai/${OPENAI_MODEL}`
    : PROVIDER === "anthropic"
      ? `anthropic/${ANTHROPIC_MODEL}`
      : `ollama/${OLLAMA_MODEL}`;

export const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS ?? 0);

export async function generate(prompt: string): Promise<string> {
  if (PROVIDER === "openai") {
    return generateWithOpenAI(prompt);
  }

  if (PROVIDER === "anthropic") {
    return generateWithAnthropic(prompt);
  }

  return generateWithOllama(prompt);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

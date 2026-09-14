import { AI_EVALUATION_SCHEMA } from "./evaluationSchema";

export const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

function extractMessageText(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;

  const message = data as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const textBlocks = (message.content ?? [])
    .filter(
      (block) => block.type === "text" && typeof block.text === "string",
    )
    .map((block) => block.text as string);

  return textBlocks.length > 0 ? textBlocks.join("\n") : undefined;
}

export async function generateWithAnthropic(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: {
          type: "json_schema",
          schema: AI_EVALUATION_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Anthropic request failed: ${response.status} ${response.statusText}\n${body}`,
    );
  }

  const data: unknown = await response.json();
  const text = extractMessageText(data);

  if (!text) {
    throw new Error("Anthropic returned no text content.");
  }

  return text;
}

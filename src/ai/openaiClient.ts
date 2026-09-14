import { AI_EVALUATION_SCHEMA } from "./evaluationSchema";

export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";

function extractResponseText(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;

  const response = data as {
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return undefined;
}

export async function generateWithOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "localization_qa_evaluation",
          strict: true,
          schema: AI_EVALUATION_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenAI request failed: ${response.status} ${response.statusText}\n${body}`,
    );
  }

  const data: unknown = await response.json();
  const text = extractResponseText(data);

  if (!text) {
    throw new Error("OpenAI returned no output text.");
  }

  return text;
}

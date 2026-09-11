export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function modelTuning(model: string) {
  if (model.startsWith("gemini-2")) {
    return { temperature: 0, thinkingConfig: { thinkingBudget: 0 } };
  }

  return { thinkingConfig: { thinkingLevel: "minimal" } };
}

export async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to .env.");
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        ...modelTuning(GEMINI_MODEL),
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Gemini request failed: ${response.status} ${response.statusText}\n${body}`,
    );
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no text.");
  }

  return text;
}

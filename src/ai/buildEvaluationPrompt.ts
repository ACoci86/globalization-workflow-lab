export function buildEvaluationPrompt(
  sourceText: string,
  targetText: string,
  sourceLocale: string,
  targetLocale: string,
): string {
  return `
You are a professional software localization QA evaluator.

Evaluate the TARGET as a translation of the SOURCE.

Source locale: ${sourceLocale}
Target locale: ${targetLocale}

SOURCE:
${sourceText}

TARGET:
${targetText}

Important evaluation rules:

- Judge meaning, not word-for-word similarity.
- A natural translation may use different grammar or wording from the source.
- Do not penalize a translation merely because there is no exact one-to-one equivalent.
- Evaluate the text in the context of software UI and product content.
- Short UI status messages should sound natural and concise in the target language.

Do NOT evaluate:
- approved terminology
- placeholders
- protected product names
- translation memory consistency

Those are checked separately by deterministic QA.

Score each category from 1 to 5:

5 = excellent / fully correct
4 = good / minor issue only
3 = acceptable but needs review
2 = significant problem
1 = incorrect or unusable

Categories:

- accuracy: source meaning is preserved
- fluency: target sounds natural to a native speaker
- style: suitable for software UI/content

Decision rules:

- "pass": translation is suitable for use
- "review": translation may be acceptable but needs human review
- "fail": clear linguistic or meaning problem

Confidence must be between 0 and 1.

Return ONLY valid JSON.

Use exactly these property names:

{
  "accuracy": <number 1-5>,
  "fluency": <number 1-5>,
  "style": <number 1-5>,
  "confidence": <number 0-1>,
  "decision": "<pass|review|fail>",
  "reasons": ["<short reason if needed>"]
}

Evaluate the actual translation.
`.trim();
}

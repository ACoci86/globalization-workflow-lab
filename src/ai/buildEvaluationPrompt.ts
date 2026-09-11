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
- Base every reason on the actual words in SOURCE and TARGET. Do not invent problems.

Style rules for ${targetLocale}:

- The user must be addressed informally, using "tu". Any use of the formal "Lei" (including "Suo", "Sua", "La", "Le" as formal pronouns) is a style error and must lower the style score to 2 or below.
- Buttons and calls to action use the imperative ("Rinnova ora"), not the infinitive ("Rinnovare ora").
- The target must not add information that is not in the source, and must not omit information that is in the source. Added or missing content is an accuracy error.
- Prefer the shortest natural phrasing. Unnecessarily long or wordy UI text is a style issue.

Do NOT evaluate:
- approved terminology
- placeholders such as {count} or {n}, treat them as opaque tokens
- protected product names
- translation memory consistency
- whether the target is untranslated

Those are checked separately by deterministic QA.

Score each category from 1 to 5:

5 = excellent / fully correct
4 = good / minor issue only
3 = acceptable but needs review
2 = significant problem
1 = incorrect or unusable

Categories:

- accuracy: source meaning is preserved, nothing added or removed
- fluency: target sounds natural to a native speaker
- style: follows the style rules above and suits software UI

Decision rules:

- "pass": translation is suitable for use
- "review": translation may be acceptable but needs human review
- "fail": clear linguistic or meaning problem

If any score is 3 or lower, "reasons" must contain at least one specific reason quoting the problematic words.
If all scores are 4 or higher, "reasons" may be empty.

Confidence must be between 0 and 1.

Return ONLY valid JSON. No explanation before or after.

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

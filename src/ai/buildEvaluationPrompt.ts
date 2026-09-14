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

Your role is to evaluate linguistic quality only.
Do NOT make the final PASS / REVIEW / FAIL decision.
A separate deterministic policy layer will make that decision.

Evaluation rules:

- Judge meaning, not word-for-word similarity.
- A natural translation may use different grammar or wording from the source.
- Do not penalize a translation merely because there is no exact one-to-one equivalent.
- Evaluate the text in the context of software UI and product content.
- Short UI status messages should sound natural and concise in the target language.
- Base every issue only on the actual SOURCE and TARGET text.
- Do not invent problems.

Style rules for ${targetLocale}:

- Address the user informally using "tu".
- Formal "Lei" forms such as "Suo", "Sua", "La", or "Le" are style issues when they address the user formally.
- Buttons and calls to action should normally use the imperative, for example "Rinnova ora", rather than the infinitive "Rinnovare ora".
- The target must not add information that is absent from the source.
- The target must not omit information that is present in the source.
- Prefer concise, natural wording suitable for software UI.

Do NOT evaluate:

- placeholders such as {count}, {date}, or {n}
- protected product names
- translation memory consistency
- whether the target is untranslated

These are checked separately by deterministic QA.

You MAY evaluate terminology only when the terminology problem affects meaning or natural linguistic usage.
Approved glossary enforcement is handled separately by deterministic QA.

Score each category from 1 to 5:

5 = excellent / fully correct
4 = good / minor issue only
3 = acceptable but needs attention
2 = significant problem
1 = incorrect or unusable

Categories:

- accuracy:
  How faithfully the target preserves the source meaning.
  Consider additions, omissions, mistranslations, and meaning reversals.

- fluency:
  How natural and grammatically correct the target sounds to a native speaker.

- style:
  Whether the target follows the style rules and is appropriate for software UI.

For every meaningful problem, add an item to "issues".

Allowed issue categories:

- accuracy
- fluency
- style
- terminology
- other

If there are no meaningful linguistic problems, return an empty issues array.

Keep issue descriptions short and specific.

Return ONLY valid JSON.
Do not include markdown.
Do not include commentary before or after the JSON.

Use exactly this structure:

{
  "accuracy": 1,
  "fluency": 1,
  "style": 1,
  "issues": [
    {
      "category": "accuracy",
      "description": "Short description of the problem."
    }
  ]
}

Evaluate the actual translation.
`.trim();
}

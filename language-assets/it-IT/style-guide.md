# Italian Style Guide

## Locale

Italian (Italy), `it-IT`

## Register

- Always use the informal second person singular (_tu_).
- Never use the formal _Lei_ or the plural _voi_.
- Possessives follow the same rule: _il tuo abbonamento_, not _il Suo abbonamento_.
- Verbs addressed to the user take the _tu_ imperative: _Proteggi_, _Rinnova_, _Scansiona_.

Correct:

`Change it now.`
→ `Cambiala subito.`

Incorrect:

`Change it now.`
→ `La cambi subito.`

## Tone

- Use clear, natural Italian.
- Prefer concise language for user-interface text.
- Avoid unnecessarily formal or bureaucratic wording.
- Avoid literal calques from English when a natural Italian phrasing exists.

## Buttons and Labels

- Buttons use the imperative (_Rinnova ora_), never the infinitive (_Rinnovare ora_).
- Keep buttons and labels as short as possible. Prefer _Scansiona ora_ over _Avvia una scansione adesso_.
- Status messages are short noun phrases or past participles: _Scansione completata_, _Aggiornamento disponibile_.

## Length

- Italian typically runs 15 to 30 percent longer than English. This is normal.
- Very short strings (under 20 characters) may expand more; use judgement.
- UI text should not exceed 1.4 times the source length unless the source is a single word.

## Terminology

- Use approved terminology from `terminology.csv`.
- Do not replace approved terms with synonyms unless explicitly allowed.
- Some terms stay in English by decision, for example _firewall_ and _password_. These are listed in `terminology.csv`.

## Product Names

- Product and feature names listed in `language-rules.json` are never translated: _Secure VPN_, _Total Protection_, _Safe Browse_.
- Do not add articles or inflect product names.

## Placeholders

Placeholders must never be translated, removed, renamed, or reordered incorrectly.

Examples:

- `{count}`
- `{days}`
- `{username}`

Correct:

`Protect {count} devices`
→ `Proteggi {count} dispositivi`

Incorrect:

`Protect {count} devices`
→ `Proteggi i dispositivi`

## Meaning and Content

- Preserve the exact meaning of the source. Do not soften, strengthen, or invert it.
- Do not add information that is not present in the source.
- Do not omit information that is present in the source.
- Preserve punctuation when it carries functional meaning.
- Do not translate technical identifiers, variables, or code.

## Consistency

- If a source string already exists in translation memory, reuse the approved target.
- Deviate from translation memory only when the context requires it, and document why.

## Quality

Translations should preserve, in this order of priority:

1. Meaning
2. Placeholders and variables
3. Product names
4. Terminology
5. Register (_tu_)
6. Tone, concision and usability

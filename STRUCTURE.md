# Project Structure

This project checks Italian translations (`it-IT`) of English UI strings (`en-US`).

There are two QA layers:

- **Deterministic QA**: fixed checks for keys, placeholders, terminology, protected terms, untranslated content, translation-memory consistency, and length.
- **AI QA**: OpenAI, Claude, or an optional local Ollama model scores meaning, fluency, and style; a deterministic policy converts those scores into `pass`, `review`, or `fail`.

OpenAI and Claude use the same schema-constrained JSON output shape so their results can be compared consistently.

## Folders

```text
globalization-workflow-lab/
├── .env                            local API keys/config (git-ignored)
├── .env.example                    safe configuration template
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── STRUCTURE.md
│
├── samples/
│   ├── source/en-US.json          English source strings
│   └── target/it-IT.json          Italian translations
│
├── language-assets/
│   ├── it-IT/
│   │   ├── language-rules.json    protected terms + max length ratio
│   │   ├── terminology.csv        approved glossary
│   │   └── style-guide.md         human-readable Italian style guide
│   └── translation-memory/
│       └── en-US_it-IT.json       approved historical translations
│
├── evaluation/
│   └── benchmark.json             deterministic QA benchmark cases
│
├── src/
│   ├── runQa.ts                   deterministic QA entry point
│   ├── runAiQa.ts                 AI QA entry point
│   │
│   ├── qa/                        deterministic checks/reporting
│   │
│   ├── ai/
│   │   ├── llmClient.ts           provider selection
│   │   ├── openaiClient.ts        OpenAI Responses API
│   │   ├── anthropicClient.ts     Anthropic Messages API
│   │   ├── ollamaClient.ts        optional local baseline
│   │   ├── evaluationSchema.ts    shared JSON output schema
│   │   ├── buildEvaluationPrompt.ts
│   │   ├── evaluateTranslation.ts
│   │   ├── applyEvaluationPolicy.ts
│   │   ├── evaluateAndDecide.ts
│   │   └── types.ts
│   │
│   ├── evaluation/                deterministic benchmark runner
│   └── types/                     report types
│
└── reports/                       generated QA reports (git-ignored)
```

## AI provider setup

Put your keys in `.env`:

```bash
PROVIDER=openai

OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-5-mini

ANTHROPIC_API_KEY=your_anthropic_key_here
ANTHROPIC_MODEL=claude-sonnet-5

OLLAMA_MODEL=qwen2.5:3b
REQUEST_DELAY_MS=0
```

Never commit `.env`. It is included in `.gitignore`.

## Commands

| Command | What it does |
|---|---|
| `npm run qa` | Runs deterministic QA and writes `reports/qa-report.json` |
| `npm run benchmark` | Runs the deterministic-rule benchmark |
| `npm run qa:ai` | Runs AI QA using `PROVIDER` from `.env` |
| `npm run qa:ai:openai` | Forces OpenAI regardless of `PROVIDER` |
| `npm run qa:ai:claude` | Forces Claude regardless of `PROVIDER` |
| `npm run qa:ai:ollama` | Forces the local Ollama baseline |
| `npm run qa:full` | Runs deterministic QA, then AI QA only if deterministic QA exits successfully |

## AI API flow

```text
source + target
     |
buildEvaluationPrompt
     |
     +--> OpenAI Responses API --------+
     |                                  |
     +--> Anthropic Messages API -------+--> shared JSON evaluation
     |                                  |       |
     +--> Ollama local API -------------+       v
                                         applyEvaluationPolicy
                                                  |
                                         pass / review / fail
```

OpenAI and Claude both receive the same evaluation schema:

```json
{
  "accuracy": 1,
  "fluency": 1,
  "style": 1,
  "confidence": 0.0,
  "decision": "review",
  "reasons": []
}
```

Scores are constrained to 1–5 and `decision` is constrained to `pass`, `review`, or `fail` by the API response schema. `evaluateTranslation.ts` still validates the returned values before accepting them.

## Deterministic checks

| Check | Result if it finds a problem |
|---|---|
| Missing key | fail |
| Extra key in target | warn |
| Missing or extra placeholder | fail |
| Glossary term not used | fail |
| Protected term changed | fail |
| Target same as source | fail (unless it is only a protected term) |
| Different from translation memory | warn |
| Target too long (over `maxLengthRatio`) | warn |

Any **fail** makes `npm run qa` exit with code 1.

## AI decision rules

`applyEvaluationPolicy.ts` makes the final decision rather than trusting the model's decision field:

| Rule | Final decision |
|---|---|
| accuracy ≤ 2 | fail |
| accuracy = 3 | review |
| confidence < 0.8 | review |
| fluency ≤ 2 or style ≤ 2 | review |
| otherwise | pass |

Any **review** or **fail** makes `npm run qa:ai` exit with code 1.

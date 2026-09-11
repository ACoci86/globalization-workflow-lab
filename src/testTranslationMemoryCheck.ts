import { loadTranslationMemory } from "./qa/translationMemory";
import { checkTranslationMemory } from "./qa/checkTranslationMemory";

const translationMemory = loadTranslationMemory(
  "language-assets/translation-memory/en-US_it-IT.json",
);

const issue = checkTranslationMemory(
  "Scan complete",
  "Scansione completata",
  "en-US",
  "it-IT",
  translationMemory,
);

console.log(issue);

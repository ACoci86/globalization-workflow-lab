import { loadTranslationMemory } from "./qa/translationMemory";

const translationMemory = loadTranslationMemory(
  "language-assets/translation-memory/en-US_it-IT.json",
);

console.log(translationMemory);

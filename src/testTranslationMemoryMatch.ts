import { loadTranslationMemory } from "./qa/translationMemory";
import { findTranslationMemoryMatch } from "./qa/findTranslationMemoryMatch";

const translationMemory = loadTranslationMemory(
  "language-assets/translation-memory/en-US_it-IT.json",
);

const match = findTranslationMemoryMatch(
  "Scan complete",
  "en-US",
  "it-IT",
  translationMemory,
);

console.log(match);

import { extractPlaceholders } from "./placeholders";

export type PlaceholderComparison = {
  missing: string[];
  extra: string[];
};

export function comparePlaceholders(
  source: string,
  target: string,
): PlaceholderComparison {
  const sourcePlaceholders = extractPlaceholders(source);
  const targetPlaceholders = extractPlaceholders(target);

  const missing = sourcePlaceholders.filter(
    (placeholder) => !targetPlaceholders.includes(placeholder),
  );

  const extra = targetPlaceholders.filter(
    (placeholder) => !sourcePlaceholders.includes(placeholder),
  );

  return {
    missing,
    extra,
  };
}

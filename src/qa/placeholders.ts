export function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{[^}]+\}/g);

  return matches ?? [];
}

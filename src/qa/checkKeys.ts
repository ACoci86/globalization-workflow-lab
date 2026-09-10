export type KeyComparison = {
  missingInTarget: string[];
  extraInTarget: string[];
};

export function checkKeys(
  source: Record<string, string>,
  target: Record<string, string>,
): KeyComparison {
  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);

  const missingInTarget = sourceKeys.filter(
    (key) => !targetKeys.includes(key),
  );

  const extraInTarget = targetKeys.filter(
    (key) => !sourceKeys.includes(key),
  );

  return {
    missingInTarget,
    extraInTarget,
  };
}

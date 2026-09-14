export type ProviderName = "openai" | "anthropic" | "ollama";

export type UsageRecord = {
  provider: ProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

const records: UsageRecord[] = [];

export function recordUsage(record: UsageRecord): void {
  records.push(record);
}

export function resetUsage(): void {
  records.length = 0;
}

function getPrices(
  provider: ProviderName,
  model: string,
): {
  inputPerMillion: number;
  outputPerMillion: number;
} | null {
  if (provider === "openai" && model === "gpt-5.6-luna") {
    return {
      inputPerMillion: 0.2,
      outputPerMillion: 1.2,
    };
  }

  if (provider === "anthropic" && model === "claude-sonnet-5") {
    return {
      inputPerMillion: 2.0,
      outputPerMillion: 10.0,
    };
  }

  if (provider === "ollama") {
    return {
      inputPerMillion: 0,
      outputPerMillion: 0,
    };
  }

  return null;
}

export function getUsageSummary() {
  let inputTokens = 0;
  let outputTokens = 0;
  let estimatedCostUsd = 0;
  let pricingAvailable = true;

  for (const record of records) {
    inputTokens += record.inputTokens;
    outputTokens += record.outputTokens;

    const prices = getPrices(record.provider, record.model);

    if (!prices) {
      pricingAvailable = false;
      continue;
    }

    estimatedCostUsd +=
      (record.inputTokens / 1_000_000) * prices.inputPerMillion +
      (record.outputTokens / 1_000_000) * prices.outputPerMillion;
  }

  return {
    inputTokens,
    outputTokens,
    estimatedCostUsd,
    pricingAvailable,
    requests: records.length,
  };
}

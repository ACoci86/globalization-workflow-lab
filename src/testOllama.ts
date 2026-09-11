import { generateWithOllama } from "./ai/ollamaClient";

async function main() {
  const response = await generateWithOllama(
    'Translate "Scan complete" into Italian. Return only the translation.',
  );

  console.log(response);
}

main();

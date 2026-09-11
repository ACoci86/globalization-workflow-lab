import { evaluateAndDecide } from "./ai/evaluateAndDecide";

async function main() {
  const result = await evaluateAndDecide(
    "Scan complete",
    "Scansione terminata",
    "en-US",
    "it-IT",
  );

  console.log(result);
}

main();

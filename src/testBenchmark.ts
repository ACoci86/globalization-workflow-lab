import { loadBenchmark } from "./evaluation/benchmark";

const benchmark = loadBenchmark(
  "evaluation/benchmark.json",
);

console.log(benchmark);

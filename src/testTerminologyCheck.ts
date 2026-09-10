import { loadTerminology } from "./qa/terminology";
import { checkTerminology } from "./qa/checkTerminology";

const terminology = loadTerminology(
  "language-assets/it-IT/terminology.csv"
);

const sourceText = "Protect up to 5 devices";
const targetText = "Proteggi fino a 5 apparecchi";

const issues = checkTerminology(
  sourceText,
  targetText,
  terminology
);

console.log(issues);

import { checkUntranslated } from "./qa/checkUntranslated";

const source = "Scan complete";
const target = "Scan complete";

const isUntranslated = checkUntranslated(source, target);

console.log(isUntranslated);

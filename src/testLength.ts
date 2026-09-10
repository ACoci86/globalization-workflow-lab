import { checkLength } from "./qa/checkLength";

const source = "Scan complete";
const target =
  "La scansione è stata completata correttamente con successo";

const issue = checkLength(source, target, 1.4);

console.log(issue);

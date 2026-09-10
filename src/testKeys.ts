import fs from "node:fs";
import path from "node:path";
import { checkKeys } from "./qa/checkKeys";

const sourcePath = path.join("samples", "source", "en-US.json");
const targetPath = path.join("samples", "target", "it-IT.json");

const source = JSON.parse(
  fs.readFileSync(sourcePath, "utf-8"),
) as Record<string, string>;

const target = JSON.parse(
  fs.readFileSync(targetPath, "utf-8"),
) as Record<string, string>;

const result = checkKeys(source, target);

console.log(result);

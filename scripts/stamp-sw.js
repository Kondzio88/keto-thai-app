import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const filePath = "dist/service-worker.js";

const hash = execSync("git rev-parse --short HEAD").toString().trim();

const content = readFileSync(filePath, "utf-8");
const stamped = content.replace(/const version = ".*?";/, `const version = "${hash}";`);

writeFileSync(filePath, stamped);

console.log(`service-worker.js: version ustawiona na "${hash}"`);

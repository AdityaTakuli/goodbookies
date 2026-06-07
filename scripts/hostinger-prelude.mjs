/**
 * First import from server.js — proves Hostinger ran the entry file.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const line = `${new Date().toISOString()} [prelude] server.js module loading | cwd=${process.cwd()}\n`;

for (const target of [
  path.join(root, "DEPLOY_STATUS.txt"),
  path.join(root, "logs", "startup.log"),
  path.join(root, "tmp", "hostinger-boot.log"),
]) {
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.appendFileSync(target, line);
  } catch {
    // ignore
  }
}

console.error("[prelude] server.js module loading, cwd=", process.cwd());

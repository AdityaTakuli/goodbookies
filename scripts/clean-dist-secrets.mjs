import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const secretFiles = [
  path.join(root, "dist/server/.dev.vars"),
  path.join(root, "dist/server/.env"),
];

for (const file of secretFiles) {
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    console.log("[build] removed secret file from dist:", path.relative(root, file));
  }
}

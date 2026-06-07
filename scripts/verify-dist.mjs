/**
 * Hostinger deploy build step — verify pre-built dist from CI, never run vite here.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deployHeartbeat } from "./deploy-heartbeat.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const required = [
  path.join(root, "dist/server/index.js"),
  path.join(root, "dist/client"),
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error("[build:hostinger] missing:", file);
    console.error("[build:hostinger] dist must be built in GitHub Actions and committed to main.");
    process.exit(1);
  }
}

console.log("[build:hostinger] pre-built dist OK");
deployHeartbeat("[build] verify-dist OK — ready to start Node");

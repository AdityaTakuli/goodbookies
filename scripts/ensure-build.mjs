/**
 * Ensures dist/client + dist/server exist before starting the app.
 * Hostinger sometimes runs the entry file without a successful `npm run build`.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const serverBundle = path.join(root, "dist/server/index.js");
const clientDir = path.join(root, "dist/client");

function buildExists() {
  return fs.existsSync(serverBundle) && fs.existsSync(clientDir);
}

export function ensureProductionBuild() {
  if (buildExists()) {
    console.log("[build] dist output already present");
    return;
  }

  console.log("[build] dist missing — running npm run build…");
  console.log("[build] cwd:", root);

  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=2048",
    },
  });

  if (!buildExists()) {
    throw new Error(
      `Build finished but output still missing. Expected:\n  ${serverBundle}\n  ${clientDir}`,
    );
  }

  console.log("[build] dist output ready");
}

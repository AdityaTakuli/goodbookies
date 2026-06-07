/**
 * Ensures dist/client + dist/server exist before starting the app.
 * Never runs vite at runtime — Hostinger cannot build (memory/thread limits).
 */
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
    console.error("[build] using pre-built dist at", root);
    return;
  }

  throw new Error(
    [
      "dist/ missing at runtime — cannot start.",
      `cwd=${process.cwd()}`,
      `appRoot=${root}`,
      `expected=${serverBundle}`,
      "Hostinger must deploy the full repo (dist/ is committed from GitHub Actions).",
    ].join("\n"),
  );
}

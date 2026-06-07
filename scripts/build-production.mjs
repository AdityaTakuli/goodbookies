/**
 * Production build entry. Hostinger cannot run vite (memory/thread limits).
 * When dist/ is already committed from CI, skip vite unless FORCE_REBUILD=1.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deployHeartbeat } from "./deploy-heartbeat.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const serverBundle = path.join(root, "dist/server/index.js");
const clientDir = path.join(root, "dist/client");

function distExists() {
  return fs.existsSync(serverBundle) && fs.existsSync(clientDir);
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit", encoding: "utf8" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

deployHeartbeat("[build] build-production.mjs started");

if (distExists() && process.env.FORCE_REBUILD !== "1") {
  console.log("[build] pre-built dist found — skipping vite (set FORCE_REBUILD=1 to rebuild)");
  deployHeartbeat("[build] skipped vite — using committed dist");
  process.exit(0);
}

run(process.execPath, [path.join(root, "scripts/write-client-build-id.mjs")]);
run(process.execPath, [path.join(root, "node_modules/vite/bin/vite.js"), "build"]);
run(process.execPath, [path.join(root, "scripts/clean-dist-secrets.mjs")]);
run(process.execPath, [path.join(root, "scripts/write-build-env-stamp.mjs")]);

if (!distExists()) {
  console.error("[build] vite finished but dist output is missing");
  process.exit(1);
}

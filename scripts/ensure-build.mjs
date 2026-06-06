/**
 * Ensures dist/client + dist/server exist before starting the app.
 * Hostinger cannot run vite build at runtime (thread/process limits) — dist must be pre-built in CI.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./fix-esbuild-perms.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const serverBundle = path.join(root, "dist/server/index.js");
const clientDir = path.join(root, "dist/client");
const viteBin = path.join(root, "node_modules/vite/bin/vite.js");

function buildExists() {
  return fs.existsSync(serverBundle) && fs.existsSync(clientDir);
}

function runViteBuild() {
  if (!fs.existsSync(viteBin)) {
    throw new Error(`Vite not installed at ${viteBin}. Run npm install first.`);
  }

  console.log("[build] dist missing — running vite build…");
  console.log("[build] cwd:", root);
  console.log("[build] node:", process.execPath);

  const env = {
    ...process.env,
    NODE_ENV: "production",
    NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=2048",
  };

  const result = spawnSync(process.execPath, [viteBin, "build"], {
    cwd: root,
    env,
    encoding: "utf8",
  });

  if (result.stdout?.trim()) {
    console.log(result.stdout.trim().split("\n").slice(-15).join("\n"));
  }
  if (result.stderr?.trim()) {
    console.error(result.stderr.trim().split("\n").slice(-20).join("\n"));
  }

  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    if (
      output.includes("EACCES") ||
      output.includes("EAGAIN") ||
      output.includes("Resource temporarily unavailable")
    ) {
      throw new Error(
        "vite build failed on this host (resource limits). " +
          "Use pre-built dist from GitHub Actions — do not build on Hostinger at runtime.",
      );
    }
    throw new Error(`vite build failed (exit ${result.status ?? "unknown"})`);
  }
}

export function ensureProductionBuild() {
  if (buildExists()) {
    console.log("[build] using pre-built dist (runtime env injection supplies Supabase keys)");
    return;
  }

  runViteBuild();

  if (!buildExists()) {
    throw new Error(
      `Build finished but output still missing. Expected:\n  ${serverBundle}\n  ${clientDir}`,
    );
  }

  console.log("[build] dist output ready");
}

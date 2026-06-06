/**
 * Ensures dist/client + dist/server exist before starting the app.
 * Uses `node vite.js build` directly — Hostinger runtime often has no `npm` in PATH.
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
const envStampPath = path.join(clientDir, ".build-env.json");

function buildExists() {
  return fs.existsSync(serverBundle) && fs.existsSync(clientDir);
}

function currentBuildEnv() {
  return {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
    key:
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
  };
}

function needsEnvRebuild() {
  const env = currentBuildEnv();
  if (!env.url || !env.key) return false;
  if (!buildExists()) return true;
  if (!fs.existsSync(envStampPath)) {
    console.log("[build] dist present but env not baked in — rebuilding…");
    return true;
  }
  try {
    const stamp = JSON.parse(fs.readFileSync(envStampPath, "utf8"));
    return stamp.url !== env.url || stamp.key !== env.key;
  } catch {
    return true;
  }
}

function writeEnvStamp() {
  const env = currentBuildEnv();
  if (!env.url || !env.key) return;
  fs.mkdirSync(clientDir, { recursive: true });
  fs.writeFileSync(envStampPath, JSON.stringify(env));
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
    if (output.includes("EACCES") && output.includes("esbuild")) {
      throw new Error(
        "vite build failed: esbuild permission denied (EACCES). " +
          "Redeploy after pushing scripts/fix-esbuild-perms.mjs, or build on Vercel instead.",
      );
    }
    throw new Error(`vite build failed (exit ${result.status ?? "unknown"})`);
  }
}

export function ensureProductionBuild() {
  if (buildExists() && !needsEnvRebuild()) {
    console.log("[build] dist output already present");
    return;
  }

  if (buildExists() && needsEnvRebuild()) {
    console.log("[build] removing stale dist for env-aware rebuild…");
    fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
  }

  runViteBuild();
  writeEnvStamp();

  if (!buildExists()) {
    throw new Error(
      `Build finished but output still missing. Expected:\n  ${serverBundle}\n  ${clientDir}`,
    );
  }

  console.log("[build] dist output ready");
}

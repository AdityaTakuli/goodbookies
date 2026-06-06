/**
 * Hostinger/shared hosting often installs esbuild without execute permission (EACCES).
 * Run after npm install and before vite build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const esbuildRoot = path.join(root, "node_modules", "@esbuild");

function chmodEsbuildBin(file) {
  try {
    fs.chmodSync(file, 0o755);
    console.log("[esbuild] chmod +x", path.relative(root, file));
    return true;
  } catch (error) {
    console.warn("[esbuild] chmod failed for", file, error.message);
    return false;
  }
}

function walkEsbuild(dir, fixed) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkEsbuild(full, fixed);
      continue;
    }
    if (entry.name === "esbuild" && full.includes(`${path.sep}bin${path.sep}`)) {
      if (chmodEsbuildBin(full)) fixed.push(full);
    }
  }
}

const fixed = [];
walkEsbuild(esbuildRoot, fixed);

// Vite nests its own @esbuild copy
walkEsbuild(path.join(root, "node_modules", "vite", "node_modules", "@esbuild"), fixed);

if (fixed.length === 0) {
  console.log("[esbuild] no binaries found to fix (may install on first build)");
} else {
  console.log(`[esbuild] fixed ${fixed.length} binary permission(s)`);
}

/**
 * Writes deploy progress to DEPLOY_STATUS.txt (repo root).
 * Runs during postinstall/build/start so File Manager shows how far deploy got.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const statusPath = path.join(root, "DEPLOY_STATUS.txt");
const logPath = path.join(root, "logs", "startup.log");

export function deployHeartbeat(step) {
  const distOk =
    fs.existsSync(path.join(root, "dist/server/index.js")) &&
    fs.existsSync(path.join(root, "dist/client"));
  const line = `${new Date().toISOString()} ${step} | node=${process.version} cwd=${process.cwd()} dist=${distOk ? "yes" : "NO"}\n`;

  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(statusPath, line);
    fs.appendFileSync(logPath, line);
  } catch {
    // read-only FS — still print to stdout for Hostinger build logs
  }

  // stderr is more likely to appear in Hostinger build/runtime log UIs
  console.error(`[deploy] ${step}`);
}

if (process.argv[2]) {
  deployHeartbeat(process.argv[2]);
}

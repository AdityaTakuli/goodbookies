/**
 * Boots Express — loaded via import() from app.js (top-level await OK here).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "tsx/esm/api";
import { deployHeartbeat } from "./deploy-heartbeat.mjs";
import { startupLog } from "./startup-log.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const serverPath = path.join(root, "server.js");

deployHeartbeat("[start] hostinger-start.mjs");
startupLog(`[boot] hostinger-start cwd=${process.cwd()} node=${process.version}`);
startupLog(`[boot] server=${serverPath}`);

async function boot() {
  if (typeof process.setSourceMapsEnabled !== "function") {
    process.setSourceMapsEnabled = () => {};
  }
  register();
  globalThis.__GOODBOOKIES_TSX__ = true;
  startupLog("[boot] tsx registered, loading server.js…");
  await import(serverPath);
}

boot().catch((error) => {
  startupLog("[boot] FATAL — server failed to start", error);
  console.error("[boot] FATAL — server failed to start", error);
  process.exit(1);
});

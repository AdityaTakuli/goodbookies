/**
 * Hostinger entry — logs to logs/startup.log before loading the app.
 * Use as npm start so failures are visible in File Manager when hPanel logs are empty.
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

try {
  register();
  startupLog("[boot] tsx registered, loading server.js…");
  await import(serverPath);
} catch (error) {
  startupLog("[boot] FATAL — server failed to start", error);
  process.exit(1);
}

/**
 * Hostinger entry (Framework preset: Express).
 */
import { deployHeartbeat } from "./scripts/deploy-heartbeat.mjs";
import express from "express";
import { register } from "tsx/esm/api";
import { readStartupLog, startupLog } from "./scripts/startup-log.mjs";

deployHeartbeat("[server.js] Express entry file executed");

process.on("uncaughtException", (error) => {
  startupLog("[startup] uncaughtException", error);
});

process.on("unhandledRejection", (reason) => {
  startupLog("[startup] unhandledRejection", reason);
});

startupLog(`[startup] server.js node=${process.version} cwd=${process.cwd()}`);

register();

const { ensureProductionBuild } = await import("./scripts/ensure-build.mjs");
const { validateProductionBuild, handleNodeRequest } = await import("./server-godaddy.mjs");

try {
  ensureProductionBuild();
  validateProductionBuild();
  startupLog("[startup] Build output OK, starting Express…");
} catch (error) {
  startupLog("[startup] Failed", error);
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST ?? "0.0.0.0";

app.disable("x-powered-by");
app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("ok");
});
app.get("/debug/startup", (_req, res) => {
  res.status(200).type("text/plain; charset=utf-8").send(readStartupLog());
});

app.use(async (req, res) => {
  try {
    await handleNodeRequest(req, res);
  } catch (error) {
    console.error("[server]", error);
    if (!res.headersSent) {
      res.status(500).type("text/plain").send("Internal Server Error");
    }
  }
});

app.listen(PORT, HOST, () => {
  startupLog(`[startup] listening on http://${HOST}:${PORT}`);
});

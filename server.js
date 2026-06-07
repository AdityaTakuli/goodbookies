/**
 * Express server — no top-level await (Hostinger lsnode may require() entry files).
 */
import "./scripts/hostinger-prelude.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { deployHeartbeat } from "./scripts/deploy-heartbeat.mjs";
import { readStartupLog, startupLog } from "./scripts/startup-log.mjs";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const distServer = path.join(appRoot, "dist/server/index.js");
const distClient = path.join(appRoot, "dist/client");

console.error("[boot] server.js starting");
console.error("[boot] node=", process.version);
console.error("[boot] cwd=", process.cwd());
console.error("[boot] appRoot=", appRoot);
console.error("[boot] dist/server=", fs.existsSync(distServer));
console.error("[boot] dist/client=", fs.existsSync(distClient));
console.error("[boot] PORT=", process.env.PORT ?? "(default 3000)");

deployHeartbeat("[server.js] Express entry file executed");

process.on("uncaughtException", (error) => {
  startupLog("[startup] uncaughtException", error);
});

process.on("unhandledRejection", (reason) => {
  startupLog("[startup] unhandledRejection", reason);
});

async function main() {
  startupLog(`[startup] server.js node=${process.version} cwd=${process.cwd()}`);

  const { ensureProductionBuild } = await import("./scripts/ensure-build.mjs");
  const { validateProductionBuild, handleNodeRequest } = await import("./server-hostinger.mjs");

  try {
    ensureProductionBuild();
    validateProductionBuild();
    startupLog("[startup] Build output OK, starting Express…");
  } catch (error) {
    startupLog("[startup] Failed", error);
    console.error("[startup] Failed:", error);
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
    console.error(`[startup] listening on http://${HOST}:${PORT}`);
  });
}

main().catch((error) => {
  startupLog("[startup] FATAL", error);
  console.error("[startup] FATAL:", error);
  process.exit(1);
});

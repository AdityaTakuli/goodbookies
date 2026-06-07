/**
 * Hostinger entry (Framework preset: Express).
 */
import express from "express";
import { register } from "tsx/esm/api";

process.on("uncaughtException", (error) => {
  console.error("[startup] uncaughtException:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[startup] unhandledRejection:", reason);
});

register();

const { ensureProductionBuild } = await import("./scripts/ensure-build.mjs");
const { validateProductionBuild, handleNodeRequest } = await import("./server-godaddy.mjs");

try {
  ensureProductionBuild();
  validateProductionBuild();
  console.log("[startup] Build output OK, starting Express…");
} catch (error) {
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
  console.log(`Good Bookies (Express) listening on http://${HOST}:${PORT}`);
});

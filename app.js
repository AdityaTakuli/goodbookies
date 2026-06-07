/**
 * Hostinger entry (lsnode.js require() — no top-level await allowed).
 */
import { deployHeartbeat } from "./scripts/deploy-heartbeat.mjs";

deployHeartbeat("[app.js] Hostinger entry file executed");

import("./scripts/hostinger-start.mjs").catch((error) => {
  console.error("[app.js] FATAL — boot failed", error);
  process.exit(1);
});

/**
 * Hostinger default entry file (hPanel often expects app.js).
 * Writes DEPLOY_STATUS.txt immediately, then boots the Express server.
 */
import { deployHeartbeat } from "./scripts/deploy-heartbeat.mjs";

deployHeartbeat("[app.js] Hostinger entry file executed");

await import("./scripts/hostinger-start.mjs");

/**
 * Hostinger Node.js entry file (Framework preset: Express).
 * Runs after `npm run build`. Do not use Vite/CRA — those serve static files only (403).
 */
import { register } from "tsx/esm/api";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
register();

await import(path.join(dir, "server-godaddy.mjs"));

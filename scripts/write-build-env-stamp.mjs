import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const stampPath = path.join(root, "dist/client/.build-env.json");

const payload = {
  url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  key:
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "",
};

fs.mkdirSync(path.dirname(stampPath), { recursive: true });
fs.writeFileSync(stampPath, JSON.stringify(payload));
console.log("[build] wrote env stamp");

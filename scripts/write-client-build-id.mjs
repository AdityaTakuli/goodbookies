import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = path.join(root, "src/generated");
const outFile = path.join(outDir, "client-build-id.ts");
const buildId = process.env.GITHUB_SHA?.slice(0, 7) ?? new Date().toISOString();

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  outFile,
  `// Auto-generated before each production build — changes the JS bundle hash.\nexport const CLIENT_BUILD_ID = ${JSON.stringify(buildId)};\n`,
);
console.log(`[build] client build id: ${buildId}`);

/**
 * Production entry for GoDaddy Node.js hosting (and similar PaaS).
 * Listens on process.env.PORT and serves SSR + static assets from dist/.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const CLIENT_ROOT = path.join(__dirname, "dist", "client");

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function ensureBuildOutput() {
  const serverIndex = path.join(__dirname, "dist", "server", "index.js");
  if (!fs.existsSync(serverIndex)) {
    console.error(
      "[server-godaddy] Missing dist/server/index.js — run `npm run build` before `npm start`.",
    );
    process.exit(1);
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function getRequestUrl(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "http";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  return new URL(req.url ?? "/", `${proto}://${host}`);
}

async function toFetchRequest(req, url) {
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await readBody(req) : undefined;
  return new Request(url.toString(), {
    method,
    headers: req.headers,
    body: body?.length ? body : undefined,
  });
}

function tryServeStatic(url, res) {
  if (!url.pathname.startsWith("/assets/")) return false;

  const relative = url.pathname.replace(/^\/+/, "");
  const filePath = path.join(CLIENT_ROOT, relative);
  if (!filePath.startsWith(CLIENT_ROOT) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

async function writeFetchResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    res.setHeader(key, value);
  });
  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

ensureBuildOutput();

const serverModule = await import("./dist/server/index.js");
const serverEntry = serverModule.default ?? serverModule;

if (typeof serverEntry?.fetch !== "function") {
  console.error("[server-godaddy] dist/server/index.js must export a fetch() handler.");
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = getRequestUrl(req);

    if (tryServeStatic(url, res)) return;

    const request = await toFetchRequest(req, url);
    const response = await serverEntry.fetch(request, {}, {});
    await writeFetchResponse(res, response);
  } catch (error) {
    console.error("[server-godaddy]", error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[server-godaddy] listening on 0.0.0.0:${PORT}`);
});

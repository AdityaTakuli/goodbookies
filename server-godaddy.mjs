/**
 * Production server: static assets, /api/mobile/*, SSR for all other routes.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST ?? "0.0.0.0";
const CLIENT_ROOT = path.join(__dirname, "dist/client");
const SERVER_BUNDLE = path.join(__dirname, "dist/server/index.js");

const MIME = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

const INVENTORY_ROUTES = {
  "/inventory/flags": () => import("./api/inventory/flags.ts"),
  "/inventory/clubs": () => import("./api/inventory/clubs.ts"),
};

const MOBILE_ROUTES = {
  "/api/mobile/venues": () => import("./api/mobile/venues.ts"),
  "/api/mobile/bookings": () => import("./api/mobile/bookings.ts"),
  "/api/mobile/sports": () => import("./api/mobile/sports.ts"),
  "/api/mobile/profile": () => import("./api/mobile/profile.ts"),
  "/api/mobile/lobbies": () => import("./api/mobile/lobbies.ts"),
  "/api/mobile/notifications": () => import("./api/mobile/notifications.ts"),
};

const PAYMENT_ROUTES = {
  "/api/create-order": () => import("./api/payments/create-order.ts"),
  "/api/verify-payment": () => import("./api/payments/verify-payment.ts"),
};

let serverEntryPromise;

export function validateProductionBuild() {
  const missing = [];
  if (!fs.existsSync(SERVER_BUNDLE)) missing.push(SERVER_BUNDLE);
  if (!fs.existsSync(CLIENT_ROOT)) missing.push(CLIENT_ROOT);
  if (missing.length) {
    throw new Error(
      `Build output missing (${missing.join(", ")}). Ensure "npm run build" completed successfully.`,
    );
  }
}

async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("./dist/server/index.js").then((m) => m.default ?? m);
  }
  return serverEntryPromise;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8") || undefined));
    req.on("error", reject);
  });
}

function createVercelResponse(nodeRes) {
  let statusCode = 200;
  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    setHeader(key, value) {
      nodeRes.setHeader(key, value);
      return res;
    },
    end(body) {
      if (!nodeRes.headersSent) nodeRes.writeHead(statusCode);
      nodeRes.end(body ?? "");
    },
    json(body) {
      if (!nodeRes.headersSent) {
        nodeRes.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
      }
      nodeRes.end(JSON.stringify(body));
    },
  };
  return res;
}

function queryFromUrl(url) {
  const query = {};
  for (const [key, value] of url.searchParams) {
    query[key] = value;
  }
  return query;
}

function tryServeStatic(url, nodeRes) {
  if (!url.pathname.startsWith("/assets/")) {
    for (const name of ["favicon.ico", "favicon.png"]) {
      if (url.pathname === `/${name}`) {
        const file = path.join(CLIENT_ROOT, name);
        if (fs.existsSync(file)) return pipeFile(file, nodeRes);
      }
    }
    return false;
  }

  const relative = url.pathname.replace(/^\/+/, "");
  const file = path.join(CLIENT_ROOT, relative);
  const resolved = path.resolve(file);
  if (!resolved.startsWith(path.resolve(CLIENT_ROOT))) return false;
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return false;
  return pipeFile(resolved, nodeRes);
}

function pipeFile(file, nodeRes) {
  const ext = path.extname(file);
  nodeRes.writeHead(200, { "content-type": MIME[ext] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(nodeRes);
  return true;
}

async function toFetchRequest(req, url) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
  });
}

async function handleInventory(pathname, req, nodeRes) {
  const load = INVENTORY_ROUTES[pathname];
  if (!load) return false;
  const mod = await load();
  const handler = mod.default;
  await handler(req, createVercelResponse(nodeRes));
  return true;
}

async function handlePayments(pathname, req, nodeRes) {
  const load = PAYMENT_ROUTES[pathname];
  if (!load) return false;

  const mod = await load();
  const handler = mod.default;
  if (typeof handler !== "function") {
    nodeRes.writeHead(500).end("Payment handler missing");
    return true;
  }

  const body = await readBody(req);
  const vercelReq = {
    method: req.method,
    headers: req.headers,
    body,
  };

  await handler(vercelReq, createVercelResponse(nodeRes));
  return true;
}

async function handleMobile(pathname, req, nodeRes, url) {
  const load = MOBILE_ROUTES[pathname];
  if (!load) return false;

  const mod = await load();
  const handler = mod.default;
  if (typeof handler !== "function") {
    nodeRes.writeHead(500).end("Mobile handler missing");
    return true;
  }

  const body = await readBody(req);
  const vercelReq = {
    method: req.method,
    headers: req.headers,
    query: queryFromUrl(url),
    body,
  };

  await handler(vercelReq, createVercelResponse(nodeRes));
  return true;
}

async function handleSsr(req, nodeRes, url) {
  const entry = await getServerEntry();
  const request = await toFetchRequest(req, url);
  const response = await entry.fetch(request, {}, {});
  nodeRes.writeHead(response.status, Object.fromEntries(response.headers));
  nodeRes.end(Buffer.from(await response.arrayBuffer()));
}

export async function handleNodeRequest(req, nodeRes) {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const proto = (req.headers["x-forwarded-proto"] ?? "http").toString().split(",")[0];
  const url = new URL(req.url ?? "/", `${proto}://${host}`);

  if (await handlePayments(url.pathname, req, nodeRes)) return;
  if (await handleMobile(url.pathname, req, nodeRes, url)) return;
  if (await handleInventory(url.pathname, req, nodeRes)) return;
  if (tryServeStatic(url, nodeRes)) return;
  await handleSsr(req, nodeRes, url);
}

export function startHttpServer() {
  validateProductionBuild();
  const server = http.createServer(async (req, nodeRes) => {
    try {
      await handleNodeRequest(req, nodeRes);
    } catch (error) {
      console.error("[server-godaddy]", error);
      if (!nodeRes.headersSent) {
        nodeRes.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
        nodeRes.end("Internal Server Error");
      }
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`Good Bookies listening on http://${HOST}:${PORT}`);
  });

  return server;
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  startHttpServer();
}

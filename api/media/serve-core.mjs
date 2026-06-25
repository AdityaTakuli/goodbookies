/**
 * Plain-JS media serve handler for Hostinger (no tsx / no dynamic .ts imports).
 */
import mysql from "mysql2/promise";

/** @type {import("mysql2/promise").Pool | null} */
let userPool = null;
/** @type {import("mysql2/promise").Pool | null} */
let venuePool = null;

function hasUserMediaConfig() {
  return Boolean(
    process.env.USER_MEDIA_DATABASE_URL ||
      process.env.MEDIA_DATABASE_URL ||
      (process.env.MYSQL_HOST &&
        process.env.MYSQL_USER &&
        process.env.MYSQL_PASSWORD &&
        process.env.MYSQL_DATABASE),
  );
}

function hasVenueMediaConfig() {
  return Boolean(
    process.env.VENUE_MEDIA_DATABASE_URL ||
      (process.env.VENUE_MEDIA_HOST &&
        process.env.VENUE_MEDIA_USER &&
        process.env.VENUE_MEDIA_PASSWORD &&
        process.env.VENUE_MEDIA_DATABASE),
  );
}

function getUserPool() {
  if (userPool) return userPool;
  const uri = process.env.USER_MEDIA_DATABASE_URL ?? process.env.MEDIA_DATABASE_URL;
  if (uri) {
    userPool = mysql.createPool({ uri, connectionLimit: 10, waitForConnections: true });
    return userPool;
  }
  userPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
    waitForConnections: true,
  });
  return userPool;
}

function getVenuePool() {
  if (venuePool) return venuePool;
  if (process.env.VENUE_MEDIA_DATABASE_URL) {
    venuePool = mysql.createPool({
      uri: process.env.VENUE_MEDIA_DATABASE_URL,
      connectionLimit: 10,
      waitForConnections: true,
    });
    return venuePool;
  }
  venuePool = mysql.createPool({
    host: process.env.VENUE_MEDIA_HOST,
    port: Number(process.env.VENUE_MEDIA_PORT ?? 3306),
    user: process.env.VENUE_MEDIA_USER,
    password: process.env.VENUE_MEDIA_PASSWORD,
    database: process.env.VENUE_MEDIA_DATABASE,
    connectionLimit: 10,
    waitForConnections: true,
  });
  return venuePool;
}

/**
 * @param {string} path
 * @returns {{ id: string, scope: "user" | "venue" | "auto" } | null}
 */
export function parseMediaAssetFromPath(path) {
  for (const scope of ["user", "venue"]) {
    const prefix = `/api/media/${scope}/`;
    if (path.startsWith(prefix)) {
      const id = path.slice(prefix.length).split("/")[0];
      if (/^[0-9a-f-]{36}$/i.test(id)) return { id, scope };
    }
  }
  const legacy = "/api/media/asset/";
  if (path.startsWith(legacy)) {
    const id = path.slice(legacy.length).split("/")[0];
    if (/^[0-9a-f-]{36}$/i.test(id)) return { id, scope: "auto" };
  }
  return null;
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {string} id
 */
async function fetchRow(db, id) {
  const [rows] = await db.execute(
    `SELECT id, mime_type, file_size, data
     FROM media_assets WHERE id = ? LIMIT 1`,
    [id],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    mime_type: String(row.mime_type),
    file_size: Number(row.file_size),
    data: Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data),
  };
}

/**
 * @param {import("mysql2/promise").Pool} db
 * @param {string} id
 * @param {"user" | "venue"} scope
 */
async function safeFetchRow(db, id, scope) {
  try {
    return await fetchRow(db, id);
  } catch (error) {
    console.warn(`[media/serve-core] fetch failed for ${scope}:`, error);
    return null;
  }
}

/**
 * @param {string} id
 * @param {"user" | "venue" | "auto"} [scope]
 */
export async function getMediaAssetById(id, scope = "auto") {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  if (scope === "user" || scope === "venue") {
    if (scope === "user" && hasUserMediaConfig()) {
      const row = await safeFetchRow(getUserPool(), id, "user");
      if (row) return row;
    }
    if (scope === "venue" && hasVenueMediaConfig()) {
      const row = await safeFetchRow(getVenuePool(), id, "venue");
      if (row) return row;
    }
    if (scope === "user" && hasVenueMediaConfig()) {
      return safeFetchRow(getVenuePool(), id, "venue");
    }
    if (scope === "venue" && hasUserMediaConfig()) {
      return safeFetchRow(getUserPool(), id, "user");
    }
    return null;
  }

  if (hasUserMediaConfig()) {
    const userRow = await safeFetchRow(getUserPool(), id, "user");
    if (userRow) return userRow;
  }
  if (hasVenueMediaConfig()) {
    return safeFetchRow(getVenuePool(), id, "venue");
  }
  return null;
}

/**
 * @param {{ method?: string, url?: string }} req
 * @param {{ status: (n: number) => any, setHeader: (k: string, v: string) => any, end: (body?: Buffer | string) => void }} res
 */
export async function serveMediaAsset(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).setHeader("content-type", "text/plain").end("Method not allowed");
    return;
  }

  const url = req.url ?? "";
  const pathname = url.startsWith("http") ? new URL(url).pathname : url.split("?")[0];
  const parsed = parseMediaAssetFromPath(pathname);
  if (!parsed) {
    res.status(400).setHeader("content-type", "text/plain").end("Invalid media path");
    return;
  }

  try {
    const asset = await getMediaAssetById(parsed.id, parsed.scope);
    if (!asset) {
      res.status(404).setHeader("content-type", "text/plain").end("Not found");
      return;
    }

    res.status(200);
    res.setHeader("content-type", asset.mime_type);
    res.setHeader("cache-control", "public, max-age=86400, immutable");
    res.setHeader("content-length", String(asset.file_size));
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(asset.data);
  } catch (error) {
    console.error("[media/serve-core]", error);
    res.status(500).setHeader("content-type", "text/plain").end("Failed to load media");
  }
}

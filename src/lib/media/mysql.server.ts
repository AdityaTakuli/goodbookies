import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { MEDIA_CATEGORY_CONFIG, type MediaCategory } from "./config";

export type MediaDbScope = "user" | "venue";

export type MediaAssetRow = {
  id: string;
  user_id: string;
  category: MediaCategory;
  mime_type: string;
  file_name: string | null;
  file_size: number;
  data: Buffer;
  created_at: Date;
};

let userPool: mysql.Pool | null = null;
let venuePool: mysql.Pool | null = null;

function hasUserMediaConfig() {
  return Boolean(
    process.env.USER_MEDIA_DATABASE_URL ||
      process.env.MEDIA_DATABASE_URL ||
      (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE),
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

export function isMysqlMediaEnabled(): boolean {
  return hasUserMediaConfig() || hasVenueMediaConfig();
}

export function mediaScopeForCategory(category: MediaCategory): MediaDbScope {
  return category === "avatars" ? "user" : "venue";
}

export function getMediaPublicPath(scope: MediaDbScope, assetId: string): string {
  return `/api/media/${scope}/${assetId}`;
}

export function getMediaPublicUrl(scope: MediaDbScope, assetId: string): string {
  const path = getMediaPublicPath(scope, assetId);
  const base = process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}

function getUserMediaPool(): mysql.Pool {
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

function getVenueMediaPool(): mysql.Pool {
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

function poolForScope(scope: MediaDbScope): mysql.Pool {
  if (scope === "user") {
    if (!hasUserMediaConfig()) throw new Error("User media MySQL not configured (MYSQL_* / USER_MEDIA_DATABASE_URL)");
    return getUserMediaPool();
  }
  if (!hasVenueMediaConfig()) {
    throw new Error("Venue media MySQL not configured (VENUE_MEDIA_* / VENUE_MEDIA_DATABASE_URL)");
  }
  return getVenueMediaPool();
}

export async function saveMediaToMysql(opts: {
  category: MediaCategory;
  ownerId: string;
  buffer: Buffer;
  mimeType: string;
  fileName?: string;
}) {
  const scope = mediaScopeForCategory(opts.category);
  const id = crypto.randomUUID();
  const db = poolForScope(scope);

  await db.execute(
    `INSERT INTO media_assets (id, user_id, category, mime_type, file_name, file_size, data)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      opts.ownerId,
      opts.category,
      opts.mimeType,
      opts.fileName ?? null,
      opts.buffer.length,
      opts.buffer,
    ],
  );

  const path = getMediaPublicPath(scope, id);
  return { id, scope, path, url: getMediaPublicUrl(scope, id) };
}

async function fetchRow(db: mysql.Pool, id: string): Promise<MediaAssetRow | null> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT id, user_id, category, mime_type, file_name, file_size, data, created_at
     FROM media_assets WHERE id = ? LIMIT 1`,
    [id],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id as string,
    user_id: row.user_id as string,
    category: row.category as MediaCategory,
    mime_type: row.mime_type as string,
    file_name: (row.file_name as string) ?? null,
    file_size: Number(row.file_size),
    data: Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data as ArrayBuffer),
    created_at: row.created_at as Date,
  };
}

export async function getMediaAssetById(id: string, scope?: MediaDbScope | "auto"): Promise<MediaAssetRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  if (scope === "user" || scope === "venue") {
    if (scope === "user") {
      if (hasUserMediaConfig()) {
        const row = await fetchRow(getUserMediaPool(), id);
        if (row) return row;
      }
      if (hasVenueMediaConfig()) {
        return fetchRow(getVenueMediaPool(), id);
      }
      return null;
    }

    if (hasVenueMediaConfig()) {
      const row = await fetchRow(getVenueMediaPool(), id);
      if (row) return row;
    }
    if (hasUserMediaConfig()) {
      return fetchRow(getUserMediaPool(), id);
    }
    return null;
  }

  if (hasUserMediaConfig()) {
    const userRow = await fetchRow(getUserMediaPool(), id);
    if (userRow) return userRow;
  }
  if (hasVenueMediaConfig()) {
    return fetchRow(getVenueMediaPool(), id);
  }
  return null;
}

export type ParsedMediaPath =
  | { id: string; scope: MediaDbScope }
  | { id: string; scope: "auto" };

export function parseMediaAssetFromPath(path: string): ParsedMediaPath | null {
  for (const scope of ["user", "venue"] as const) {
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

export function assertAllowedMime(category: MediaCategory, mimeType: string) {
  const allowed = MEDIA_CATEGORY_CONFIG[category].mimeTypes;
  if (!allowed.includes(mimeType)) {
    throw new Error(`File type not allowed. Use: ${allowed.join(", ")}`);
  }
}

export function assertAllowedSize(category: MediaCategory, size: number) {
  const max = MEDIA_CATEGORY_CONFIG[category].maxBytes;
  if (size > max) {
    const mb = Math.round(max / (1024 * 1024));
    throw new Error(`File too large (max ${mb} MB)`);
  }
}

export async function listVenueMediaBySlug(venueSlug: string): Promise<
  { asset_id: string; media_type: "image" | "video"; sort_order: number; url: string }[]
> {
  if (!venueSlug || !hasVenueMediaConfig()) return [];

  try {
    const db = getVenueMediaPool();
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      `SELECT vmm.asset_id, vmm.media_type, vmm.sort_order
       FROM venue_media_map vmm
       JOIN media_assets ma ON ma.id = vmm.asset_id
       WHERE vmm.venue_slug = ? AND vmm.is_active = 1
       ORDER BY vmm.sort_order ASC`,
      [venueSlug],
    );

    return rows.map((row) => ({
      asset_id: String(row.asset_id),
      media_type: row.media_type === "video" ? "video" : "image",
      sort_order: Number(row.sort_order ?? 0),
      url: getMediaPublicPath("venue", String(row.asset_id)),
    }));
  } catch (error) {
    // Keep venue pages working even if mapping table isn't present yet.
    console.warn("[media/mysql] listVenueMediaBySlug failed:", error);
    return [];
  }
}

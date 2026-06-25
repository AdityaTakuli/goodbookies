import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { a as MEDIA_CATEGORY_CONFIG } from "./config-B_G86tQ8.js";
import { i as isMysqlMediaEnabled, s as saveMediaToMysql } from "./mysql.server-SSRPTvVf.js";
import "./index-BlRNeFf7.js";
import "./server-BtWK4XFp.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "node:buffer";
import "events";
import "./worker-entry-DgYaRr7O.js";
import "node:events";
import "net";
import "tls";
import "timers";
import "stream";
import "buffer";
import "string_decoder";
import "crypto";
import "zlib";
import "util";
import "url";
const projectRoot = fileURLToPath(new URL("../../..", import.meta.url));
const MIME_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm"
};
function getUploadsRoot() {
  const configured = process.env.UPLOADS_DIR;
  if (configured) return path.resolve(configured);
  return path.join(projectRoot, "storage", "uploads");
}
function getMediaPublicUrl(relativePath) {
  const normalized = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  const base = process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "");
  return base ? `${base}${normalized}` : normalized;
}
function assertAllowedMime(category, mimeType) {
  const allowed = MEDIA_CATEGORY_CONFIG[category].mimeTypes;
  if (!allowed.includes(mimeType)) {
    throw new Error(`File type not allowed. Use: ${allowed.join(", ")}`);
  }
}
function assertAllowedSize(category, size) {
  const max = MEDIA_CATEGORY_CONFIG[category].maxBytes;
  if (size > max) {
    const mb = Math.round(max / (1024 * 1024));
    throw new Error(`File too large (max ${mb} MB)`);
  }
}
function saveMediaToDisk(opts) {
  const ext = MIME_EXT[opts.mimeType];
  if (!ext) throw new Error("Unsupported file type");
  const safeOwner = opts.ownerId.replace(/[^a-zA-Z0-9-]/g, "");
  if (!safeOwner) throw new Error("Invalid owner id");
  const fileName = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(getUploadsRoot(), opts.category, safeOwner);
  fs.mkdirSync(dir, { recursive: true });
  const diskPath = path.join(dir, fileName);
  fs.writeFileSync(diskPath, opts.buffer);
  const publicPath = `/uploads/${opts.category}/${safeOwner}/${fileName}`;
  return { path: publicPath, url: getMediaPublicUrl(publicPath), diskPath };
}
async function saveMediaBuffer(opts) {
  assertAllowedMime(opts.category, opts.mimeType);
  assertAllowedSize(opts.category, opts.buffer.length);
  if (isMysqlMediaEnabled()) {
    const saved = await saveMediaToMysql({
      category: opts.category,
      ownerId: opts.ownerId,
      buffer: opts.buffer,
      mimeType: opts.mimeType,
      fileName: opts.fileName
    });
    return { path: saved.path, url: saved.url, diskPath: void 0 };
  }
  return saveMediaToDisk(opts);
}
async function assertCanUploadCategory(userId, category) {
  if (category === "avatars") return;
  const [{ data: admin }, { data: owner }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    supabaseAdmin.from("owners").select("status").eq("id", userId).maybeSingle()
  ]);
  if (admin) return;
  if (owner?.status === "approved") return;
  throw new Error("Forbidden: admin or approved owner required for this upload");
}
async function saveUploadedMediaForUser(opts) {
  await assertCanUploadCategory(opts.userId, opts.category);
  return await saveMediaBuffer({
    category: opts.category,
    ownerId: opts.userId,
    buffer: opts.buffer,
    mimeType: opts.mimeType
  });
}
export {
  saveUploadedMediaForUser
};

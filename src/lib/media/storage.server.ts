import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MEDIA_CATEGORY_CONFIG, type MediaCategory } from "@/lib/media/config";
import { isMysqlMediaEnabled, saveMediaToMysql } from "@/lib/media/mysql.server";

const projectRoot = fileURLToPath(new URL("../../..", import.meta.url));

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

export function getUploadsRoot(): string {
  const configured = process.env.UPLOADS_DIR;
  if (configured) return path.resolve(configured);
  return path.join(projectRoot, "storage", "uploads");
}

export function getMediaPublicUrl(relativePath: string): string {
  const normalized = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  const base = process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "");
  return base ? `${base}${normalized}` : normalized;
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

function saveMediaToDisk(opts: {
  category: MediaCategory;
  ownerId: string;
  buffer: Buffer;
  mimeType: string;
}) {
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

/** Saves to Hostinger MySQL when configured, otherwise local disk (dev fallback). */
export async function saveMediaBuffer(opts: {
  category: MediaCategory;
  ownerId: string;
  buffer: Buffer;
  mimeType: string;
  fileName?: string;
}) {
  assertAllowedMime(opts.category, opts.mimeType);
  assertAllowedSize(opts.category, opts.buffer.length);

  if (isMysqlMediaEnabled()) {
    const saved = await saveMediaToMysql({
      category: opts.category,
      ownerId: opts.ownerId,
      buffer: opts.buffer,
      mimeType: opts.mimeType,
      fileName: opts.fileName,
    });
    return { path: saved.path, url: saved.url, diskPath: undefined };
  }

  return saveMediaToDisk(opts);
}

export function resolveUploadFilePath(urlPath: string): string | null {
  if (!urlPath.startsWith("/uploads/")) return null;
  const relative = urlPath.replace(/^\/uploads\//, "");
  if (relative.includes("..")) return null;

  const file = path.join(getUploadsRoot(), relative);
  const resolved = path.resolve(file);
  const root = path.resolve(getUploadsRoot());
  if (!resolved.startsWith(root)) return null;
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return null;
  return resolved;
}

export function uploadMimeFromExt(ext: string): string | undefined {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };
  return map[ext.toLowerCase()];
}

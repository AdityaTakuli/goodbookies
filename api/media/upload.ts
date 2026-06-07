import { parseMultipartForm } from "./parse-multipart.ts";
import { getUserIdFromRequest, sendError, sendJson, setCors } from "../mobile/shared.js";
import { isMediaCategory } from "../../src/lib/media/config.ts";
import { saveUploadedMediaForUser } from "../../src/lib/media/upload-service.server.ts";

export const config = { runtime: "nodejs" };

type NodeReq = {
  method?: string;
  headers: { authorization?: string; "content-type"?: string; "content-length"?: string };
  body?: Buffer | string;
};

type NodeRes = {
  status: (n: number) => NodeRes;
  json: (body: unknown) => void;
  end: (body?: string) => void;
  setHeader: (k: string, v: string) => void;
};

async function readRawBody(req: NodeReq): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  return Buffer.alloc(0);
}

export default async function handler(req: NodeReq, res: NodeRes) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return sendError(res, "Method not allowed", 405);
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) return sendError(res, "Unauthorized", 401);

  try {
    const body = await readRawBody(req);
    const contentType = req.headers["content-type"];
    const { fields, files } = parseMultipartForm(body, contentType);

    const category = fields.category;
    if (!category || !isMediaCategory(category)) {
      return sendError(res, "Invalid category (avatars, venues, videos)");
    }

    const file = files.find((f) => f.name === "file");
    if (!file?.data?.length) return sendError(res, "Missing file");
    if (!file.mimeType) return sendError(res, "Missing file content type");

    const saved = await saveUploadedMediaForUser({
      userId,
      category,
      buffer: file.data,
      mimeType: file.mimeType,
    });

    sendJson(res, { path: saved.path, url: saved.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    sendError(res, message, 400);
  }
}

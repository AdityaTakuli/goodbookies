import { getMediaAssetById, parseMediaAssetFromPath } from "../../src/lib/media/mysql.server.ts";

export const config = { runtime: "nodejs" };

type NodeReq = { method?: string; url?: string };
type NodeRes = {
  status: (n: number) => NodeRes;
  setHeader: (k: string, v: string) => void;
  end: (body?: Buffer | string) => void;
};

export default async function handler(req: NodeReq, res: NodeRes) {
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
    console.error("[media/serve]", error);
    res.status(500).setHeader("content-type", "text/plain").end("Failed to load media");
  }
}

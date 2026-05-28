type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    // @ts-ignore Build output module has no type declarations on Vercel.
    serverEntryPromise = import("../dist/server/index.js").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

export const config = {
  runtime: "nodejs",
};

function toUint8Array(chunk: unknown): Uint8Array {
  if (chunk instanceof Uint8Array) return chunk;
  if (typeof chunk === "string") return new TextEncoder().encode(chunk);
  return new Uint8Array(0);
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function readRequestBody(req: any): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk: unknown) => chunks.push(toUint8Array(chunk)));
    req.on("end", () => resolve(concatChunks(chunks)));
    req.on("error", reject);
  });
}

function getRequestUrl(req: any): URL {
  const protocolHeader = req.headers["x-forwarded-proto"];
  const hostHeader = req.headers["x-forwarded-host"] ?? req.headers.host;
  const protocol = Array.isArray(protocolHeader) ? protocolHeader[0] : protocolHeader ?? "https";
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader ?? "localhost";
  return new URL(req.url ?? "/", `${protocol}://${host}`);
}

async function toFetchRequest(req: any, url: URL): Promise<Request> {
  const method = req.method ?? "GET";
  const canHaveBody = method !== "GET" && method !== "HEAD";
  const body = canHaveBody ? await readRequestBody(req) : undefined;
  const bodyCopy = body && body.length > 0 ? Uint8Array.from(body) : undefined;
  const bodyInit = bodyCopy ? new Blob([bodyCopy]) : undefined;

  return new Request(url.toString(), {
    method,
    headers: (req.headers ?? {}) as HeadersInit,
    body: bodyInit,
  });
}

async function writeResponse(res: any, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const body = new Uint8Array(await response.arrayBuffer());
  res.end(body);
}

export default async function handler(req: any, res: any): Promise<void> {
  try {
    const server = await getServerEntry();
    const url = getRequestUrl(req);
    const rewrittenPath = url.searchParams.get("path");

    if (rewrittenPath != null) {
      const normalizedPath = rewrittenPath.replace(/^\/+/, "");
      url.pathname = normalizedPath.length > 0 ? `/${normalizedPath}` : "/";
      url.searchParams.delete("path");
    }

    const request = await toFetchRequest(req, url);
    const response = await server.fetch(request, {}, {});
    await writeResponse(res, response);
  } catch (error) {
    console.error("[api/render] invocation failed", error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}

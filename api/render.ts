type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type RequestLike = {
  url?: string;
  method?: string;
  headers?: unknown;
  body?: unknown;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

export const config = {
  runtime: "nodejs",
};

function getRequestUrl(request: Request): URL {
  const requestLike = request as RequestLike;

  try {
    return new URL(request.url);
  } catch {
    const protocol = getHeaderValue(requestLike.headers, "x-forwarded-proto") ?? "https";
    const host =
      getHeaderValue(requestLike.headers, "x-forwarded-host") ??
      getHeaderValue(requestLike.headers, "host") ??
      "localhost";
    return new URL(requestLike.url ?? "/", `${protocol}://${host}`);
  }
}

function getHeaderValue(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined;
  if (typeof headers === "object" && headers !== null && "get" in headers) {
    const maybeGet = (headers as { get?: (key: string) => string | null }).get;
    if (typeof maybeGet === "function") {
      const value = maybeGet(name);
      return value ?? undefined;
    }
  }

  const recordHeaders = headers as Record<string, string | string[] | undefined>;
  const raw = recordHeaders[name] ?? recordHeaders[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

function toFetchRequest(request: Request, url: URL): Request {
  if (request instanceof Request) {
    return new Request(url.toString(), request);
  }

  const req = request as RequestLike;
  const method = req.method ?? "GET";
  const headers = (req.headers ?? {}) as HeadersInit;
  const canHaveBody = method !== "GET" && method !== "HEAD";

  return new Request(url.toString(), {
    method,
    headers,
    body: canHaveBody ? ((req.body as BodyInit | null) ?? null) : undefined,
  });
}

export default async function handler(request: Request): Promise<Response> {
  try {
    const server = await getServerEntry();
    const url = getRequestUrl(request);
    const rewrittenPath = url.searchParams.get("path");

    if (rewrittenPath != null) {
      const normalizedPath = rewrittenPath.replace(/^\/+/, "");
      url.pathname = normalizedPath.length > 0 ? `/${normalizedPath}` : "/";
      url.searchParams.delete("path");
    }

    return await server.fetch(toFetchRequest(request, url), {}, {});
  } catch (error) {
    console.error("[api/render] invocation failed", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

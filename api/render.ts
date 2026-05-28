type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
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
  try {
    return new URL(request.url);
  } catch {
    const protocol = request.headers.get("x-forwarded-proto") ?? "https";
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost";
    return new URL(request.url, `${protocol}://${host}`);
  }
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

    return await server.fetch(new Request(url.toString(), request), {}, {});
  } catch (error) {
    console.error("[api/render] invocation failed", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

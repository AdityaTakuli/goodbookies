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
  const server = await getServerEntry();
  const url = getRequestUrl(request);
  const rewrittenPath = url.searchParams.get("path");

  if (rewrittenPath != null) {
    url.pathname = "/" + rewrittenPath.replace(/^\/+/, "");
    url.searchParams.delete("path");
  }

  return server.fetch(new Request(url.toString(), request), {}, {});
}

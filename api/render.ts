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

export default async function handler(request: Request): Promise<Response> {
  const server = await getServerEntry();
  const url = new URL(request.url);
  const rewrittenPath = url.searchParams.get("path");

  if (rewrittenPath != null) {
    url.pathname = "/" + rewrittenPath.replace(/^\/+/, "");
    url.searchParams.delete("path");
  }

  return server.fetch(new Request(url.toString(), request), {}, {});
}

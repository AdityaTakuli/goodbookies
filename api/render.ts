import server from "../src/server";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const rewrittenPath = url.searchParams.get("path");

  if (rewrittenPath != null) {
    url.pathname = "/" + rewrittenPath.replace(/^\/+/, "");
    url.searchParams.delete("path");
  }

  return server.fetch(new Request(url.toString(), request), {}, {});
}

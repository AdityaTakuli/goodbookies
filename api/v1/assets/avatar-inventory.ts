import { AVATAR_INVENTORY } from "../../../src/lib/inventory/catalog.ts";

export const config = { runtime: "nodejs" };

export default function handler(_req: unknown, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (b: unknown) => void } }) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).json({ avatars: AVATAR_INVENTORY });
}

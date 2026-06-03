import { defaultSports, getSupabaseAdmin, sendError, sendJson, setCors } from "./shared.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: { method?: string }, res: any) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }
  if (req.method !== "GET") return sendError(res, "Method not allowed", 405);

  try {
    const supabase = getSupabaseAdmin();
    let { data, error } = await supabase.from("sports").select("id, name, slug, icon").eq("is_active", true).order("name");
    if (error) throw error;
    if (!data?.length) {
      await supabase.from("sports").upsert(defaultSports, { onConflict: "slug" });
      const seeded = await supabase.from("sports").select("id, name, slug, icon").eq("is_active", true).order("name");
      data = seeded.data;
    }
    sendJson(res, { sports: data ?? [] });
  } catch (e: any) {
    sendError(res, e.message ?? "Failed to load sports", 500);
  }
}

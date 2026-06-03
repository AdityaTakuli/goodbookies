import { getSupabaseAdmin, getUserIdFromRequest, sendError, sendJson, setCors } from "./shared.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: { method?: string }, res: any) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }
  if (req.method !== "GET") return sendError(res, "Method not allowed", 405);

  const userId = await getUserIdFromRequest(req as any);
  if (!userId) return sendError(res, "Unauthorized", 401);

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("notifications")
      .select("id, title, message, type, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    sendJson(res, { notifications: data ?? [] });
  } catch (e: any) {
    sendError(res, e.message ?? "Failed to load notifications", 500);
  }
}

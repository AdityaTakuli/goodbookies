import { getSupabaseAdmin, getUserIdFromRequest, sendError, sendJson, setCors } from "./shared.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: { method?: string; body?: any }, res: any) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }

  const userId = await getUserIdFromRequest(req as any);
  if (!userId) return sendError(res, "Unauthorized", 401);

  const supabase = getSupabaseAdmin();

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, created_at, is_banned")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      if (data?.is_banned) return sendError(res, "Account suspended", 403);

      const { count } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "confirmed");

      sendJson(res, {
        profile: {
          id: data?.id,
          name: data?.full_name ?? data?.email ?? "Player",
          email: data?.email,
          phone: data?.phone,
          subtitle: `${count ?? 0} bookings completed`,
          walletBalance: 0,
          sports: ["Football", "Cricket", "Badminton", "Basketball"],
        },
      });
    } catch (e: any) {
      sendError(res, e.message ?? "Failed to load profile", 500);
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { full_name, phone } = body ?? {};
      const { error } = await supabase
        .from("profiles")
        .update({
          ...(full_name ? { full_name } : {}),
          ...(phone ? { phone } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw error;
      sendJson(res, { ok: true });
    } catch (e: any) {
      sendError(res, e.message ?? "Failed to update profile", 500);
    }
    return;
  }

  sendError(res, "Method not allowed", 405);
}

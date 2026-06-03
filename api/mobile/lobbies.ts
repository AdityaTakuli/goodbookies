import { getSupabaseAdmin, resolveImageUrl, sendError, sendJson, setCors } from "./shared.js";

export const config = { runtime: "nodejs" };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req: { method?: string; query?: Record<string, string | string[] | undefined> }, res: any) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }
  if (req.method !== "GET") return sendError(res, "Method not allowed", 405);

  try {
    const sport = typeof req.query?.sport === "string" ? req.query.sport : undefined;
    const date = typeof req.query?.date === "string" ? req.query.date : todayISO();
    const supabase = getSupabaseAdmin();

    const { data: rows, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_date, start_hour, end_hour, player_count, total_price, user_id, venue:venues(id, name, slug, city, image_url, max_players_allowed, sport:sports(name, slug, icon))",
      )
      .eq("is_open_lobby", true)
      .eq("status", "confirmed")
      .gte("booking_date", date)
      .order("booking_date", { ascending: true })
      .limit(100);

    if (error) throw error;

    let filtered = (rows ?? []).filter((b: any) => {
      const max = Math.max(1, b.venue?.max_players_allowed ?? 1);
      return (b.player_count ?? 0) < max;
    });
    if (sport) {
      filtered = filtered.filter((b: any) => b.venue?.sport?.slug === sport);
    }

    const hostIds = Array.from(new Set(filtered.map((b: any) => b.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", hostIds.length ? hostIds : ["00000000-0000-0000-0000-000000000000"]);

    const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const lobbies = filtered.map((b: any) => {
      const max = Math.max(1, b.venue?.max_players_allowed ?? 1);
      const host = pmap.get(b.user_id);
      const hostName = host?.full_name || host?.email || "Host";
      const perPerson = b.total_price > 0 ? Math.ceil(b.total_price / max) : 0;
      return {
        id: b.id,
        bookingId: b.id,
        title: `${hostName}'s ${b.venue?.sport?.name ?? "Match"}`,
        venue: `${b.venue?.name ?? "Venue"}, ${b.venue?.city ?? ""}`,
        schedule: `${b.booking_date} · ${b.start_hour}:00`,
        imageUrl: resolveImageUrl(b.venue?.image_url),
        price: perPerson,
        filled: b.player_count ?? 0,
        capacity: max,
        spotsOpen: max - (b.player_count ?? 0),
        sportSlug: b.venue?.sport?.slug,
        sportName: b.venue?.sport?.name,
        sportIcon: b.venue?.sport?.icon,
        isLive: b.booking_date === todayISO(),
        isLastSpot: max - (b.player_count ?? 0) === 1,
        hostName,
      };
    });

    sendJson(res, { lobbies });
  } catch (e: any) {
    sendError(res, e.message ?? "Failed to load lobbies", 500);
  }
}

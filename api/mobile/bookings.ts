import { getSupabaseAdmin, getUserIdFromRequest, resolveImageUrl, sendError, sendJson, setCors } from "./shared.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: { method?: string }, res: any) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }

  const userId = await getUserIdFromRequest(req as any);
  if (!userId) return sendError(res, "Unauthorized", 401);

  try {
    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_date, start_hour, end_hour, player_count, total_price, status, is_open_lobby, venue:venues(name, slug, city, image_url, sport:sports(name, icon))")
      .eq("user_id", userId)
      .order("booking_date", { ascending: false });

    if (error) throw error;

    const bookings = (data ?? []).map((b: any) => {
      const isUpcoming = b.status !== "cancelled" && b.booking_date >= today;
      let statusLabel = "Confirmed";
      if (b.status === "cancelled") statusLabel = "Cancelled";
      else if (!isUpcoming) statusLabel = "Played";

      return {
        id: b.id,
        title: b.venue?.name ?? "Booking",
        dateTime: `${b.booking_date} · ${b.start_hour}:00`,
        price: b.total_price,
        imageUrl: resolveImageUrl(b.venue?.image_url),
        status: statusLabel,
        isUpcoming,
        isOpenLobby: b.is_open_lobby,
        venueSlug: b.venue?.slug,
        city: b.venue?.city,
        sportName: b.venue?.sport?.name,
      };
    });

    sendJson(res, { bookings });
  } catch (e: any) {
    sendError(res, e.message ?? "Failed to load bookings", 500);
  }
}

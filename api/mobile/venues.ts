import { getSupabaseAdmin, resolveImageUrl, sendError, sendJson, setCors } from "./shared.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: { method?: string; query?: Record<string, string | string[] | undefined> }, res: any) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }
  if (req.method !== "GET") return sendError(res, "Method not allowed", 405);

  try {
    const sport = typeof req.query?.sport === "string" ? req.query.sport : undefined;
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("venues")
      .select("id, name, slug, description, address, city, image_url, price_per_hour, rating, amenities, max_players_allowed, sport:sports(name, slug, icon)")
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .order("rating", { ascending: false });

    if (sport) {
      const { data: s } = await supabase.from("sports").select("id").eq("slug", sport).maybeSingle();
      if (s?.id) query = query.eq("sport_id", s.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const venues = (data ?? []).map((v: any) => ({
      id: v.id,
      slug: v.slug,
      name: v.name,
      city: v.city,
      address: v.address,
      location: `${v.address}, ${v.city}`,
      imageUrl: resolveImageUrl(v.image_url),
      pricePerHour: v.price_per_hour,
      rating: Number(v.rating ?? 4.5),
      reviewCount: 0,
      sportName: v.sport?.name,
      sportSlug: v.sport?.slug,
      sportIcon: v.sport?.icon,
      maxPlayersAllowed: v.max_players_allowed,
    }));

    sendJson(res, { venues });
  } catch (e: any) {
    sendError(res, e.message ?? "Failed to load venues", 500);
  }
}

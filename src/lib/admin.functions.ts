import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const adminSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const today = todayISO();
    const monthStart = today.slice(0, 7) + "-01";
    const weekAgo = daysAgoISO(7);

    const [bToday, bMonth, venues, users, cancels] = await Promise.all([
      supabaseAdmin.from("bookings").select("total_price, status").eq("booking_date", today),
      supabaseAdmin.from("bookings").select("total_price, status").gte("booking_date", monthStart),
      supabaseAdmin.from("venues").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "cancelled").gte("booking_date", monthStart),
    ]);

    const todayRows = bToday.data ?? [];
    const monthRows = bMonth.data ?? [];
    const revToday = todayRows.filter(r => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0);
    const revMonth = monthRows.filter(r => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0);

    return {
      bookingsToday: todayRows.length,
      revenueToday: revToday,
      revenueMonth: revMonth,
      activeVenues: venues.count ?? 0,
      newUsersWeek: users.count ?? 0,
      cancelMonth: cancels.count ?? 0,
    };
  });

export const adminRevenueSeries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { days?: number } | undefined) => z.object({ days: z.number().int().min(7).max(365).default(30) }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const start = daysAgoISO(data.days - 1);
    const { data: rows } = await supabaseAdmin
      .from("bookings")
      .select("booking_date, total_price, status")
      .gte("booking_date", start)
      .eq("status", "confirmed");
    const map = new Map<string, number>();
    for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
    rows?.forEach(r => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  });

export const adminBookingsBySport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("venue:venues(sport:sports(name))");
    const counts = new Map<string, number>();
    (data ?? []).forEach((b: any) => {
      const name = b.venue?.sport?.name ?? "Unknown";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  });

export const adminTopVenues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("venue_id, total_price, status, venue:venues(name, rating, sport:sports(name))");
    const map = new Map<string, { name: string; sport: string; rating: number; bookings: number; revenue: number }>();
    (data ?? []).forEach((b: any) => {
      const k = b.venue_id;
      const cur = map.get(k) ?? { name: b.venue?.name ?? "—", sport: b.venue?.sport?.name ?? "—", rating: Number(b.venue?.rating ?? 0), bookings: 0, revenue: 0 };
      cur.bookings += 1;
      if (b.status === "confirmed") cur.revenue += b.total_price ?? 0;
      map.set(k, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  });

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { limit?: number; status?: string; sport?: string } | undefined) =>
    z.object({
      limit: z.number().int().min(1).max(100).default(50),
      status: z.enum(["all", "confirmed", "cancelled", "pending"]).default("all"),
      sport: z.string().optional(),
    }).parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin
      .from("bookings")
      .select("id, booking_date, start_hour, end_hour, total_price, status, user_id, venue:venues(name, slug, sport:sports(name, slug))")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const filtered = data.sport
      ? (rows ?? []).filter((r: any) => r.venue?.sport?.slug === data.sport)
      : (rows ?? []);
    const userIds = Array.from(new Set(filtered.map((r: any) => r.user_id)));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return filtered.map((r: any) => ({ ...r, profile: pmap.get(r.user_id) ?? null }));
  });

export const adminCancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("bookings").update({ status: "cancelled" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListVenues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("venues")
      .select("id, name, slug, city, address, price_per_hour, opening_hour, closing_hour, rating, is_active, image_url, sport:sports(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const venueInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens only"),
  sport_id: z.string().uuid(),
  city: z.string().min(2).max(80),
  address: z.string().min(2).max(255),
  description: z.string().max(2000).optional().nullable(),
  image_url: z.string().url().max(500).optional().nullable(),
  price_per_hour: z.number().int().min(0).max(1000000),
  opening_hour: z.number().int().min(0).max(23),
  closing_hour: z.number().int().min(1).max(24),
  is_active: z.boolean().default(true),
});

export const adminUpsertVenue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: any) => z.object({ id: z.string().uuid().optional(), values: venueInputSchema }).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("venues").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin.from("venues").insert(data.values).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteVenue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("venues").update({ is_active: false }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListSports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin.from("sports").select("*").order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertSport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: any) => z.object({
    id: z.string().uuid().optional(),
    values: z.object({
      name: z.string().min(2).max(80),
      slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
      icon: z.string().max(40).optional().nullable(),
      is_active: z.boolean().default(true),
    }),
  }).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("sports").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin.from("sports").insert(data.values).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (profiles ?? []).map(p => p.id);
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("user_id, total_price, status")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const stats = new Map<string, { count: number; spent: number }>();
    (bookings ?? []).forEach((b: any) => {
      const s = stats.get(b.user_id) ?? { count: 0, spent: 0 };
      s.count += 1;
      if (b.status === "confirmed") s.spent += b.total_price ?? 0;
      stats.set(b.user_id, s);
    });
    return (profiles ?? []).map(p => ({ ...p, stats: stats.get(p.id) ?? { count: 0, spent: 0 } }));
  });
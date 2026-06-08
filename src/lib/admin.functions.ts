import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isAllowedImageReference } from "@/lib/media/paths";
import { toCsv } from "@/lib/services/export";
import { refundRazorpayPayment } from "@/lib/services/razorpay";

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
      const cur = map.get(k) ?? { name: b.venue?.name ?? "N/A", sport: b.venue?.sport?.name ?? "N/A", rating: Number(b.venue?.rating ?? 0), bookings: 0, revenue: 0 };
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
      .select("id, booking_date, start_hour, end_hour, total_price, status, user_id, player_count, player_names, venue:venues(name, slug, sport:sports(name, slug))")
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
  image_url: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .refine((v) => !v || isAllowedImageReference(v), {
      message: "Use an uploaded media path or https URL",
    }),
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
      .select("id, full_name, email, phone, created_at, is_banned")
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

export const adminBookingsVolume = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { days?: number } | undefined) => z.object({ days: z.number().int().min(7).max(365).default(30) }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const start = daysAgoISO(data.days - 1);
    const { data: rows } = await supabaseAdmin
      .from("bookings")
      .select("booking_date")
      .gte("booking_date", start);
    const map = new Map<string, number>();
    for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
    rows?.forEach(r => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + 1));
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  });

export const adminMonthlyRevenue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { year?: number } | undefined) => z.object({ year: z.number().int().min(2020).max(2100).default(new Date().getFullYear()) }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const start = `${data.year}-01-01`;
    const end = `${data.year}-12-31`;
    const { data: rows } = await supabaseAdmin
      .from("bookings")
      .select("booking_date, total_price, status")
      .gte("booking_date", start)
      .lte("booking_date", end)
      .eq("status", "confirmed");
    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, label: new Date(data.year, i).toLocaleString("en", { month: "short" }), revenue: 0 }));
    rows?.forEach(r => {
      const m = new Date(r.booking_date).getMonth();
      months[m].revenue += r.total_price ?? 0;
    });
    const best = months.reduce((a, b) => (b.revenue > a.revenue ? b : a), months[0]);
    return { months, bestMonth: best };
  });

export const adminUserGrowth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { days?: number } | undefined) => z.object({ days: z.number().int().min(30).max(365).default(90) }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const start = daysAgoISO(data.days);
    const { data: rows } = await supabaseAdmin
      .from("profiles")
      .select("created_at")
      .gte("created_at", start + "T00:00:00Z")
      .order("created_at");
    let cumulative = 0;
    const map = new Map<string, number>();
    for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
    rows?.forEach(r => {
      const d = r.created_at.slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([date, signups]) => {
      cumulative += signups;
      return { date, signups, total: cumulative };
    });
  });

export const adminCancellationTrend = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { days?: number } | undefined) => z.object({ days: z.number().int().min(7).max(90).default(30) }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const start = daysAgoISO(data.days - 1);
    const { data: rows } = await supabaseAdmin
      .from("bookings")
      .select("booking_date, status")
      .gte("booking_date", start);
    const map = new Map<string, { total: number; cancelled: number }>();
    for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), { total: 0, cancelled: 0 });
    rows?.forEach(r => {
      const cur = map.get(r.booking_date)!;
      cur.total += 1;
      if (r.status === "cancelled") cur.cancelled += 1;
      map.set(r.booking_date, cur);
    });
    return Array.from(map.entries()).map(([date, v]) => ({
      date,
      rate: v.total ? Math.round((v.cancelled / v.total) * 1000) / 10 : 0,
    }));
  });

export const adminRevenueByVenue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("total_price, status, venue:venues(name)")
      .eq("status", "confirmed");
    const map = new Map<string, number>();
    (data ?? []).forEach((b: any) => {
      const name = b.venue?.name ?? "Unknown";
      map.set(name, (map.get(name) ?? 0) + (b.total_price ?? 0));
    });
    return Array.from(map.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  });

export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { status?: string } | undefined) =>
    z.object({ status: z.enum(["all", "success", "cancelled", "pending"]).default("all") }).parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin
      .from("bookings")
      .select("id, booking_date, total_price, status, created_at, user_id, venue:venues(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.status !== "all") {
      const map: Record<string, string> = { success: "confirmed", cancelled: "cancelled", pending: "pending" };
      q = q.eq("status", map[data.status]);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r: any) => r.user_id)));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (rows ?? []).map((r: any) => ({
      id: r.id,
      booking_id: r.id,
      user: pmap.get(r.user_id)?.full_name || pmap.get(r.user_id)?.email || "N/A",
      venue: r.venue?.name ?? "N/A",
      amount: r.total_price,
      method: "card",
      status: r.status === "confirmed" ? "success" : r.status,
      date: r.created_at,
    }));
  });

export const adminPaymentsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const monthStart = todayISO().slice(0, 7) + "-01";
    const { data: rows } = await supabaseAdmin
      .from("bookings")
      .select("total_price, status")
      .gte("booking_date", monthStart);
    let collected = 0;
    let refunded = 0;
    (rows ?? []).forEach(r => {
      if (r.status === "confirmed") collected += r.total_price ?? 0;
      if (r.status === "cancelled") refunded += r.total_price ?? 0;
    });
    return { collected, refunded, net: collected - refunded };
  });

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin.from("site_settings").select("key, value").order("key");
    if (error) throw new Error(error.message);
    return Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: Record<string, string>) => z.record(z.string(), z.string()).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    for (const [key, value] of Object.entries(data)) {
      const { error } = await supabaseAdmin
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminSendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { title: string; message: string; target_type?: string; channel?: string }) =>
    z.object({
      title: z.string().min(1).max(120),
      message: z.string().min(1).max(2000),
      target_type: z.enum(["all", "sport", "user"]).default("all"),
      channel: z.enum(["in-app", "email", "sms"]).default("in-app"),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { data: users } = await supabaseAdmin.from("profiles").select("id");
    const inserts = (users ?? []).map(u => ({
      user_id: u.id,
      title: data.title,
      message: data.message,
      type: "offer",
    }));
    if (inserts.length) {
      const { error } = await supabaseAdmin.from("notifications").insert(inserts);
      if (error) throw new Error(error.message);
    }
    await supabaseAdmin.from("admin_notification_log").insert({
      sent_by: context.userId,
      title: data.title,
      message: data.message,
      target_type: data.target_type,
      channel: data.channel,
      delivery_count: inserts.length,
    });
    return { ok: true, count: inserts.length };
  });

export const adminNotificationLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("admin_notification_log")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminRefundPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { bookingId: string }) => z.object({ bookingId: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { data: booking } = await supabaseAdmin.from("bookings").select("payment_id, status").eq("id", data.bookingId).maybeSingle();
    if (!booking?.payment_id) throw new Error("No payment linked");
    const { data: pay } = await supabaseAdmin.from("payments").select("razorpay_payment_id, amount").eq("id", booking.payment_id).maybeSingle();
    if (pay?.razorpay_payment_id) await refundRazorpayPayment(pay.razorpay_payment_id, pay.amount * 100);
    await supabaseAdmin.from("payments").update({ status: "refunded" }).eq("id", booking.payment_id);
    await supabaseAdmin.from("bookings").update({ status: "cancelled" }).eq("id", data.bookingId);
    return { ok: true };
  });

export const adminExportAnalyticsCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const start = daysAgoISO(29);
    const { data: rows } = await supabaseAdmin
      .from("bookings")
      .select("booking_date, total_price, status")
      .gte("booking_date", start)
      .eq("status", "confirmed");
    const map = new Map<string, number>();
    for (let i = 0; i < 30; i++) map.set(daysAgoISO(29 - i), 0);
    rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
    const csvRows = Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
    return { csv: toCsv(csvRows), filename: `admin-analytics-${todayISO()}.csv` };
  });

export const adminBanUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; banned: boolean }) =>
    z.object({ id: z.string().uuid(), banned: z.boolean() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("profiles").update({ is_banned: data.banned }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
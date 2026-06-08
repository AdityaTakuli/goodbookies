import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { calculateBookingTotal } from "@/lib/pricing";
import { sendEmail } from "@/lib/services/email";
import { isAllowedImageReference } from "@/lib/media/paths";
import { toCsv } from "@/lib/services/export";
import { refundRazorpayPayment } from "@/lib/services/razorpay";
import { assertPhoneAvailable } from "@/lib/phone.server";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

async function assertApprovedOwner(userId: string) {
  const { data } = await supabaseAdmin.from("owners").select("id, status").eq("id", userId).maybeSingle();
  if (!data || data.status !== "approved") throw new Error("Forbidden: approved owner required");
  return data;
}

async function assertOwnerVenue(userId: string, venueId: string) {
  await assertApprovedOwner(userId);
  const { data } = await supabaseAdmin.from("venues").select("id, owner_id").eq("id", venueId).maybeSingle();
  if (!data || data.owner_id !== userId) throw new Error("Forbidden: not your venue");
  return data;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const venueSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
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
  price_per_hour: z.number().int().min(0),
  opening_hour: z.number().int().min(0).max(23),
  closing_hour: z.number().int().min(1).max(24),
  slot_duration_minutes: z.number().int().min(30).max(240).default(60),
  max_players_allowed: z.number().int().min(1).max(100).default(10),
  venue_type: z.string().optional(),
  state: z.string().optional().nullable(),
  pin_code: z.string().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  operating_days: z.array(z.number().int().min(0).max(6)).optional(),
  advance_booking_days: z.number().int().min(1).max(365).optional(),
  confirmation_mode: z.enum(["instant", "manual"]).optional(),
  cancellation_policy: z.string().max(2000).optional().nullable(),
  is_active: z.boolean().optional(),
});

// ——— Auth / register ———
export const registerOwner = createServerFn({ method: "POST" })
  .inputValidator((i: { name: string; email: string; phone: string; password: string; business_name?: string; city: string }) =>
    z.object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      phone: z.string().min(10).max(15),
      password: z.string().min(8).max(72),
      business_name: z.string().max(120).optional(),
      city: z.string().min(2).max(80),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const linkPartnerToUser = async (userId: string, phone: string) => {
      const { data: existingOwner } = await supabaseAdmin.from("owners").select("id").eq("id", userId).maybeSingle();
      if (existingOwner) throw new Error("This account already has partner access.");

      const { error: ownerErr } = await supabaseAdmin.from("owners").insert({
        id: userId,
        name: data.name,
        email: data.email,
        phone,
        business_name: data.business_name ?? null,
        city: data.city,
        status: "approved",
        approved_at: new Date().toISOString(),
      });
      if (ownerErr) throw new Error(ownerErr.message);

      await supabaseAdmin.from("profiles").update({
        account_type: "both",
        full_name: data.name,
        phone,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);

      await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "user" }, { onConflict: "user_id,role" });
      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "owner" }, { onConflict: "user_id,role" });
      if (roleErr) throw new Error(roleErr.message);
    };

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, account_type")
      .eq("email", data.email)
      .maybeSingle();

    if (existingProfile) {
      const normalizedPhone = await assertPhoneAvailable(data.phone, existingProfile.id);
      if (!supabaseUrl || !supabaseAnon) throw new Error("Server auth not configured");
      const verifyClient = createClient(supabaseUrl, supabaseAnon, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error: pwErr } = await verifyClient.auth.signInWithPassword({ email: data.email, password: data.password });
      if (pwErr) {
        throw new Error("This email already has a player account. Log in first, or enter the correct password to add partner access.");
      }
      await linkPartnerToUser(existingProfile.id, normalizedPhone);
      return {
        ok: true,
        message: "Partner access linked to your existing account. Log in to use both My Account and Partner.",
      };
    }

    const normalizedPhone = await assertPhoneAvailable(data.phone);

    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name, phone: normalizedPhone, account_type: "both" },
    });
    if (authErr) throw new Error(authErr.message);

    await supabaseAdmin.from("profiles").update({ account_type: "both" }).eq("id", authUser.user.id);
    await linkPartnerToUser(authUser.user.id, normalizedPhone);
    return { ok: true, message: "Partner account created. You can book turfs and manage venues with the same login." };
  });

export const getOwnerStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("owners")
      .select("id, status, rejection_reason, business_name, city, name, email, phone")
      .eq("id", context.userId)
      .maybeSingle();
    return data;
  });

// ——— Dashboard ———
export const ownerSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertApprovedOwner(context.userId);
    const today = todayISO();
    const monthStart = today.slice(0, 7) + "-01";
    const { data: venueIds } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
    const ids = (venueIds ?? []).map((v) => v.id);
    if (!ids.length) {
      return { bookingsToday: 0, revenueToday: 0, revenueMonth: 0, activeVenues: 0, pendingBookings: 0, cancelMonth: 0 };
    }
    const [bToday, bMonth, venues, pending, cancels] = await Promise.all([
      supabaseAdmin.from("bookings").select("total_price, status").in("venue_id", ids).eq("booking_date", today),
      supabaseAdmin.from("bookings").select("total_price, status").in("venue_id", ids).gte("booking_date", monthStart),
      supabaseAdmin.from("venues").select("id", { count: "exact", head: true }).eq("owner_id", context.userId).eq("is_active", true).eq("approval_status", "approved"),
      supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).in("venue_id", ids).eq("status", "pending"),
      supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).in("venue_id", ids).eq("status", "cancelled").gte("booking_date", monthStart),
    ]);
    const todayRows = bToday.data ?? [];
    const monthRows = bMonth.data ?? [];
    return {
      bookingsToday: todayRows.length,
      revenueToday: todayRows.filter((r) => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0),
      revenueMonth: monthRows.filter((r) => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0),
      activeVenues: venues.count ?? 0,
      pendingBookings: pending.count ?? 0,
      cancelMonth: cancels.count ?? 0,
    };
  });

export const ownerRevenueSeries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { days?: number } | undefined) => z.object({ days: z.number().int().min(7).max(90).default(30) }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const { data: venues } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
    const ids = (venues ?? []).map((v) => v.id);
    const start = daysAgoISO(data.days - 1);
    const map = new Map<string, number>();
    for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
    if (ids.length) {
      const { data: rows } = await supabaseAdmin
        .from("bookings")
        .select("booking_date, total_price, status")
        .in("venue_id", ids)
        .gte("booking_date", start)
        .eq("status", "confirmed");
      rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
    }
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  });

export const ownerBookingsVolume = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { days?: number } | undefined) => z.object({ days: z.number().int().min(7).max(90).default(30) }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const { data: venues } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
    const ids = (venues ?? []).map((v) => v.id);
    const start = daysAgoISO(data.days - 1);
    const map = new Map<string, number>();
    for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
    if (ids.length) {
      const { data: rows } = await supabaseAdmin.from("bookings").select("booking_date").in("venue_id", ids).gte("booking_date", start);
      rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + 1));
    }
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  });

export const ownerPeakHours = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { venueId?: string } | undefined) => z.object({ venueId: z.string().uuid().optional() }).parse(i ?? {}))
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    let q = supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
    if (data.venueId) q = q.eq("id", data.venueId);
    const { data: venues } = await q;
    const ids = (venues ?? []).map((v) => v.id);
    const grid: { day: number; hour: number; count: number }[] = [];
    for (let day = 0; day < 7; day++) for (let hour = 6; hour < 23; hour++) grid.push({ day, hour, count: 0 });
    if (!ids.length) return grid;
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("booking_date, start_hour, end_hour")
      .in("venue_id", ids)
      .eq("status", "confirmed");
    bookings?.forEach((b) => {
      const dow = new Date(b.booking_date + "T12:00:00").getDay();
      for (let h = b.start_hour; h < b.end_hour; h++) {
        const cell = grid.find((g) => g.day === dow && g.hour === h);
        if (cell) cell.count += 1;
      }
    });
    return grid;
  });

// ——— Venues ———
export const ownerListVenues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertApprovedOwner(context.userId);
    const { data, error } = await supabaseAdmin
      .from("venues")
      .select("*, sport:sports(name, slug, icon)")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const ownerUpsertVenue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id?: string; values: z.infer<typeof venueSchema> }) =>
    z.object({ id: z.string().uuid().optional(), values: venueSchema }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const payload = {
      ...data.values,
      owner_id: context.userId,
      approval_status: "approved",
      is_active: data.values.is_active ?? true,
      rejection_reason: null,
    };
    if (data.id) {
      await assertOwnerVenue(context.userId, data.id);
      const { error } = await supabaseAdmin.from("venues").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin.from("venues").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const ownerDeleteVenue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.id);
    const { error } = await supabaseAdmin.from("venues").update({ is_active: false }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ——— Slots ———
export const ownerListSlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { venueId: string; month: string }) =>
    z.object({ venueId: z.string().uuid(), month: z.string().regex(/^\d{4}-\d{2}$/) }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    const start = `${data.month}-01`;
    const endMonth = data.month.split("-");
    const lastDay = new Date(Number(endMonth[0]), Number(endMonth[1]), 0).getDate();
    const end = `${data.month}-${String(lastDay).padStart(2, "0")}`;

    const [{ data: bookings }, { data: blocks }] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("booking_date, start_hour, end_hour, status")
        .eq("venue_id", data.venueId)
        .gte("booking_date", start)
        .lte("booking_date", end),
      supabaseAdmin.from("slot_blocks").select("*").eq("venue_id", data.venueId),
    ]);

    return { bookings: bookings ?? [], blocks: blocks ?? [] };
  });

export const ownerBlockSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: {
    venueId: string; date?: string; startTime: string; endTime: string; reason?: string;
    isRecurring?: boolean; recurrenceDay?: number;
  }) =>
    z.object({
      venueId: z.string().uuid(),
      date: z.string().optional(),
      startTime: z.string(),
      endTime: z.string(),
      reason: z.string().max(200).optional(),
      isRecurring: z.boolean().optional(),
      recurrenceDay: z.number().int().min(0).max(6).optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    const { error } = await supabaseAdmin.from("slot_blocks").insert({
      venue_id: data.venueId,
      block_date: data.date ?? null,
      start_time: data.startTime,
      end_time: data.endTime,
      reason: data.reason ?? null,
      is_recurring: data.isRecurring ?? false,
      recurrence_day: data.recurrenceDay ?? null,
      created_by_owner_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ownerUnblockSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; venueId: string }) =>
    z.object({ id: z.string().uuid(), venueId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    const { error } = await supabaseAdmin.from("slot_blocks").delete().eq("id", data.id).eq("venue_id", data.venueId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ——— Pricing ———
export const ownerGetPricing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { venueId: string }) => z.object({ venueId: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    const [peak, day, date, duration] = await Promise.all([
      supabaseAdmin.from("venue_peak_pricing").select("*").eq("venue_id", data.venueId),
      supabaseAdmin.from("venue_day_pricing").select("*").eq("venue_id", data.venueId),
      supabaseAdmin.from("venue_date_pricing").select("*").eq("venue_id", data.venueId).order("date"),
      supabaseAdmin.from("venue_duration_discounts").select("*").eq("venue_id", data.venueId).order("min_hours"),
    ]);
    return {
      peak: peak.data ?? [],
      day: day.data ?? [],
      date: date.data ?? [],
      duration: duration.data ?? [],
    };
  });

export const ownerSavePeakPricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { venueId: string; rules: unknown[] }) =>
    z.object({ venueId: z.string().uuid(), rules: z.array(z.any()) }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    await supabaseAdmin.from("venue_peak_pricing").delete().eq("venue_id", data.venueId);
    if (data.rules.length) {
      const rows = data.rules.map((r: any) => ({
        venue_id: data.venueId,
        day_of_week: r.day_of_week ?? null,
        start_time: r.start_time,
        end_time: r.end_time,
        surcharge_type: r.surcharge_type ?? "percent",
        surcharge_value: r.surcharge_value ?? 0,
      }));
      const { error } = await supabaseAdmin.from("venue_peak_pricing").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const ownerSaveDayPricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { venueId: string; rules: { day_of_week: number; price_override: number }[] }) =>
    z.object({
      venueId: z.string().uuid(),
      rules: z.array(z.object({ day_of_week: z.number(), price_override: z.number() })),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    await supabaseAdmin.from("venue_day_pricing").delete().eq("venue_id", data.venueId);
    if (data.rules.length) {
      const { error } = await supabaseAdmin.from("venue_day_pricing").insert(
        data.rules.map((r) => ({ venue_id: data.venueId, ...r })),
      );
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const ownerAddDatePricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { venueId: string; date: string; price_override: number }) =>
    z.object({ venueId: z.string().uuid(), date: z.string(), price_override: z.number().int().min(0) }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    const { error } = await supabaseAdmin.from("venue_date_pricing").upsert(
      { venue_id: data.venueId, date: data.date, price_override: data.price_override },
      { onConflict: "venue_id,date" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ownerSaveDurationDiscounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { venueId: string; rules: { min_hours: number; discount_percent: number }[] }) =>
    z.object({
      venueId: z.string().uuid(),
      rules: z.array(z.object({ min_hours: z.number(), discount_percent: z.number() })),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertOwnerVenue(context.userId, data.venueId);
    await supabaseAdmin.from("venue_duration_discounts").delete().eq("venue_id", data.venueId);
    if (data.rules.length) {
      const { error } = await supabaseAdmin.from("venue_duration_discounts").insert(
        data.rules.map((r) => ({ venue_id: data.venueId, ...r })),
      );
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ——— Coupons ———
export const ownerListCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertApprovedOwner(context.userId);
    const { data, error } = await supabaseAdmin.from("coupons").select("*").eq("owner_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const ownerUpsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: any) =>
    z.object({
      id: z.string().uuid().optional(),
      values: z.object({
        code: z.string().min(3).max(20),
        discount_type: z.enum(["flat", "percent"]),
        discount_value: z.number().min(0),
        min_booking_amount: z.number().int().min(0).default(0),
        max_uses: z.number().int().optional().nullable(),
        expiry_date: z.string().optional().nullable(),
        venue_id: z.string().uuid().optional().nullable(),
        is_active: z.boolean().default(true),
      }),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const row = { owner_id: context.userId, ...data.values, code: data.values.code.toUpperCase() };
    if (data.id) {
      const { error } = await supabaseAdmin.from("coupons").update(row).eq("id", data.id).eq("owner_id", context.userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin.from("coupons").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const ownerDeleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", data.id).eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ——— Bookings ———
export const ownerListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { status?: string; venueId?: string } | undefined) =>
    z.object({ status: z.enum(["all", "confirmed", "cancelled", "pending"]).default("all"), venueId: z.string().uuid().optional() }).parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const { data: venues } = await supabaseAdmin.from("venues").select("id, name").eq("owner_id", context.userId);
    const ids = (venues ?? []).map((v) => v.id);
    if (!ids.length) return [];
    let q = supabaseAdmin
      .from("bookings")
      .select("*, venue:venues(name, slug)")
      .in("venue_id", data.venueId ? [data.venueId] : ids)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r: any) => r.user_id)));
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, email, phone").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
    return (rows ?? []).map((r: any) => ({ ...r, profile: pmap.get(r.user_id) }));
  });

export const ownerConfirmBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { data: b } = await supabaseAdmin.from("bookings").select("venue_id, user_id").eq("id", data.id).maybeSingle();
    if (!b) throw new Error("Not found");
    await assertOwnerVenue(context.userId, b.venue_id);
    await supabaseAdmin.from("bookings").update({ status: "confirmed" }).eq("id", data.id);
    await supabaseAdmin.from("notifications").insert({
      user_id: b.user_id,
      title: "Booking confirmed",
      message: "Your booking was confirmed by the venue.",
      type: "booking",
    });
    return { ok: true };
  });

export const ownerRejectBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { data: b } = await supabaseAdmin.from("bookings").select("venue_id, user_id, payment_id").eq("id", data.id).maybeSingle();
    if (!b) throw new Error("Not found");
    await assertOwnerVenue(context.userId, b.venue_id);
    await supabaseAdmin.from("bookings").update({ status: "cancelled" }).eq("id", data.id);
    if (b.payment_id) {
      const { data: pay } = await supabaseAdmin.from("payments").select("razorpay_payment_id").eq("id", b.payment_id).maybeSingle();
      if (pay?.razorpay_payment_id) await refundRazorpayPayment(pay.razorpay_payment_id);
      await supabaseAdmin.from("payments").update({ status: "refunded" }).eq("id", b.payment_id);
    }
    return { ok: true };
  });

// ——— Payouts ———
export const ownerGetPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertApprovedOwner(context.userId);
    const { data: settings } = await supabaseAdmin.from("site_settings").select("value").eq("key", "platform_commission_rate").maybeSingle();
    const { data: owner } = await supabaseAdmin.from("owners").select("platform_commission_override").eq("id", context.userId).maybeSingle();
    const rate = Number(owner?.platform_commission_override ?? settings?.value ?? 10);

    const { data: venues } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
    const ids = (venues ?? []).map((v) => v.id);
    let lifetime = 0;
    if (ids.length) {
      const { data: bookings } = await supabaseAdmin.from("bookings").select("total_price").in("venue_id", ids).eq("status", "confirmed");
      lifetime = (bookings ?? []).reduce((s, b) => s + (b.total_price ?? 0), 0);
    }
    const commission = Math.round(lifetime * (rate / 100));
    const { data: payouts } = await supabaseAdmin.from("payouts").select("*").eq("owner_id", context.userId).order("created_at", { ascending: false });
    const paid = (payouts ?? []).filter((p) => p.status === "paid").reduce((s, p) => s + p.net_amount, 0);
    const { data: bank } = await supabaseAdmin.from("owner_payout_details").select("*").eq("owner_id", context.userId).maybeSingle();

    return {
      commissionRate: rate,
      lifetimeEarned: lifetime,
      commissionDeducted: commission,
      netEarned: lifetime - commission,
      pendingPayout: lifetime - commission - paid,
      lastPayout: payouts?.[0] ?? null,
      payouts: payouts ?? [],
      bank: bank ?? null,
    };
  });

export const ownerSavePayoutDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { account_holder_name: string; account_number: string; ifsc_code: string; bank_name?: string }) =>
    z.object({
      account_holder_name: z.string().min(2),
      account_number: z.string().min(8),
      ifsc_code: z.string().min(8),
      bank_name: z.string().optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const { error } = await supabaseAdmin.from("owner_payout_details").upsert(
      { owner_id: context.userId, ...data, updated_at: new Date().toISOString() },
      { onConflict: "owner_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ownerUpdateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { name?: string; phone?: string; business_name?: string }) => z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    business_name: z.string().optional(),
  }).parse(i))
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const { error } = await supabaseAdmin.from("owners").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ownerExportAnalyticsCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertApprovedOwner(context.userId);
    const { data: venues } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
    const ids = (venues ?? []).map((v) => v.id);
    const start = daysAgoISO(29);
    const map = new Map<string, number>();
    for (let i = 0; i < 30; i++) map.set(daysAgoISO(29 - i), 0);
    if (ids.length) {
      const { data: rows } = await supabaseAdmin
        .from("bookings")
        .select("booking_date, total_price, status")
        .in("venue_id", ids)
        .gte("booking_date", start)
        .eq("status", "confirmed");
      rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
    }
    const csvRows = Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
    return { csv: toCsv(csvRows), filename: `owner-analytics-${todayISO()}.csv` };
  });

// ——— Admin: owners & venue approvals ———
export const adminListOwnerRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin.from("owners").select("*").eq("status", "pending").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminReviewOwnerRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; action: "approve" | "reject"; reason?: string }) =>
    z.object({ id: z.string().uuid(), action: z.enum(["approve", "reject"]), reason: z.string().optional() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { data: owner } = await supabaseAdmin.from("owners").select("email, name").eq("id", data.id).maybeSingle();
    const status = data.action === "approve" ? "approved" : "rejected";
    await supabaseAdmin.from("owners").update({
      status,
      rejection_reason: data.action === "reject" ? (data.reason ?? "Not approved") : null,
      approved_at: data.action === "approve" ? new Date().toISOString() : null,
      approved_by: data.action === "approve" ? context.userId : null,
    }).eq("id", data.id);
    if (data.action === "approve") {
      await supabaseAdmin.from("user_roles").upsert({ user_id: data.id, role: "owner" }, { onConflict: "user_id,role" });
    }
    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: data.action === "approve" ? "Good Bookies — Partner approved" : "Good Bookies — Application update",
        html: data.action === "approve"
          ? `<p>Hi ${owner.name},</p><p>Your venue partner account is approved. <a href="${process.env.APP_URL ?? ""}/owner/login">Log in to your dashboard</a>.</p>`
          : `<p>Hi ${owner.name},</p><p>Your application was not approved. ${data.reason ?? ""}</p>`,
      });
    }
    return { ok: true };
  });

export const adminListVenueApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("venues")
      .select("*, sport:sports(name), owner:owners(name, email)")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminReviewVenue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; action: "approve" | "reject"; reason?: string }) =>
    z.object({ id: z.string().uuid(), action: z.enum(["approve", "reject"]), reason: z.string().optional() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const patch =
      data.action === "approve"
        ? { approval_status: "approved", is_active: true, rejection_reason: null }
        : { approval_status: "rejected", is_active: false, rejection_reason: data.reason ?? "Not approved" };
    const { error } = await supabaseAdmin.from("venues").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListOwners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin.from("owners").select("*").neq("status", "pending").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const owners = data ?? [];
    const ids = owners.map((o) => o.id);
    const { data: venueCounts } = await supabaseAdmin.from("venues").select("owner_id").in("owner_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const counts = new Map<string, number>();
    (venueCounts ?? []).forEach((v) => counts.set(v.owner_id!, (counts.get(v.owner_id!) ?? 0) + 1));
    return owners.map((o) => ({ ...o, venueCount: counts.get(o.id) ?? 0 }));
  });

export const adminUpdateOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; status?: string; platform_commission_override?: number | null }) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["approved", "suspended", "rejected"]).optional(),
      platform_commission_override: z.number().nullable().optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const patch: Record<string, unknown> = {};
    if (data.status) patch.status = data.status;
    if (data.platform_commission_override !== undefined) patch.platform_commission_override = data.platform_commission_override;
    const { error } = await supabaseAdmin.from("owners").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.status === "suspended") {
      await supabaseAdmin.from("venues").update({ is_active: false }).eq("owner_id", data.id);
    }
    return { ok: true };
  });


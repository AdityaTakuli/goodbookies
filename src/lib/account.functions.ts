import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertPhoneAvailable } from "@/lib/phone.server";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, phone, created_at, is_banned")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.is_banned) throw new Error("Account suspended");
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { full_name?: string; phone?: string }) =>
    z.object({
      full_name: z.string().min(2).max(120).optional(),
      phone: z.string().max(20).optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const patch: { full_name?: string; phone?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.phone !== undefined) {
      patch.phone = data.phone.trim() ? await assertPhoneAvailable(data.phone, context.userId) : "";
    }

    const { error } = await context.supabase.from("profiles").update(patch).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cancelMyBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { data: booking, error: fErr } = await context.supabase
      .from("bookings")
      .select("id, status, booking_date, start_hour")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (fErr || !booking) throw new Error("Booking not found");
    if (booking.status === "cancelled") throw new Error("Already cancelled");

    const { data: setting } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "cancellation_hours")
      .maybeSingle();
    const cancelHours = Number(setting?.value ?? 24);
    const slotStart = new Date(`${booking.booking_date}T${String(booking.start_hour).padStart(2, "0")}:00:00`);
    const hoursUntil = (slotStart.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil < cancelHours) {
      throw new Error(`Cancellation must be at least ${cancelHours} hours before your slot`);
    }

    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      title: "Booking cancelled",
      message: `Your booking was cancelled. Refunds (if eligible) are processed within 5–7 business days.`,
      type: "cancellation",
    });
    return { ok: true };
  });

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("id, title, message, type, is_read, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", context.userId)
      .eq("is_read", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("id, booking_date, total_price, status, created_at, venue:venues(name, sport:sports(name))")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((b: any) => ({
      booking_id: b.id,
      venue: b.venue?.name ?? "N/A",
      sport: b.venue?.sport?.name ?? "N/A",
      date: b.booking_date,
      amount: b.total_price,
      status: b.status === "cancelled" ? "refunded" : b.status === "confirmed" ? "success" : b.status,
      paid_at: b.created_at,
    }));
  });

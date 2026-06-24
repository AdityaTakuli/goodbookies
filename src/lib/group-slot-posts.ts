import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildVenueDaySessions, type BookingWindowRow } from "@/lib/slot-schedule";
import {
  bookingEndMinute,
  bookingStartMinute,
  formatSlotRange,
  slotStepMinutes,
} from "@/lib/slot-time";

function formatGroupMessage(input: {
  venueName: string;
  venueSlug: string;
  sportIcon?: string;
  date: string;
  startMinute: number;
  endMinute: number;
  bookedPlayers: number;
  totalCapacity: number;
  remainingPlayers: number;
}) {
  const icon = input.sportIcon ?? "⚽";
  return [
    `${icon} GOOD BOOKIES · ${input.venueName}`,
    `📅 ${input.date} · ${formatSlotRange(input.startMinute, input.endMinute)}`,
    `👥 ${input.bookedPlayers}/${input.totalCapacity} players · ${input.remainingPlayers} spot${input.remainingPlayers === 1 ? "" : "s"} open`,
    `🔗 Book: goodbookies.co.in/venues/${input.venueSlug}`,
  ].join("\n");
}

async function bookingsShareToGroupColumnReady() {
  const { error } = await supabaseAdmin.from("bookings").select("share_to_group").limit(1);
  return !error?.message?.includes("share_to_group");
}

async function groupPostsTableReady() {
  const { error } = await supabaseAdmin.from("group_slot_posts").select("id").limit(1);
  return !error?.message?.includes("group_slot_posts");
}

/** Upsert WhatsApp/community group post when a slot has open capacity. */
export async function syncGroupSlotPostsForVenueDay(venueId: string, bookingDate: string) {
  if (!(await groupPostsTableReady())) return;

  const { data: venue } = await supabaseAdmin
    .from("venues")
    .select("id, name, slug, max_players_allowed, slot_duration_minutes, sport:sports(icon)")
    .eq("id", venueId)
    .maybeSingle();
  if (!venue) return;

  const hasShareColumn = await bookingsShareToGroupColumnReady();
  const bookingFields = hasShareColumn
    ? "id, start_hour, end_hour, start_minute, end_minute, player_count, is_open_lobby, status, share_to_group"
    : "id, start_hour, end_hour, start_minute, end_minute, player_count, is_open_lobby, status";

  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select(bookingFields)
    .eq("venue_id", venueId)
    .eq("booking_date", bookingDate)
    .in("status", ["confirmed", "pending"]);

  const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
  const totalCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));
  const sessions = buildVenueDaySessions((bookings ?? []) as BookingWindowRow[], totalCapacity, stepMinutes);

  const sportIcon = (venue.sport as { icon?: string } | null)?.icon;

  for (const session of sessions) {
    if (session.remainingCapacity <= 0) {
      await supabaseAdmin
        .from("group_slot_posts")
        .delete()
        .eq("venue_id", venueId)
        .eq("booking_date", bookingDate)
        .eq("start_minute", session.startMinute)
        .eq("end_minute", session.endMinute);
      continue;
    }

    const sessionBookings = (bookings ?? []).filter((b) => {
      if (hasShareColumn && (b as { share_to_group?: boolean }).share_to_group === false) {
        return false;
      }
      const start = bookingStartMinute(b);
      const end = bookingEndMinute(b);
      return start < session.endMinute && end > session.startMinute;
    });
    if (sessionBookings.length === 0) continue;

    const message = formatGroupMessage({
      venueName: venue.name,
      venueSlug: venue.slug,
      sportIcon,
      date: bookingDate,
      startMinute: session.startMinute,
      endMinute: session.endMinute,
      bookedPlayers: session.bookedPlayers,
      totalCapacity: session.totalCapacity,
      remainingPlayers: session.remainingCapacity,
    });

    await supabaseAdmin.from("group_slot_posts").upsert(
      {
        venue_id: venueId,
        booking_date: bookingDate,
        start_minute: session.startMinute,
        end_minute: session.endMinute,
        message,
        booked_players: session.bookedPlayers,
        total_capacity: session.totalCapacity,
        remaining_players: session.remainingCapacity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "venue_id,booking_date,start_minute,end_minute" },
    );

    const webhook = process.env.WHATSAPP_GROUP_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId,
            bookingDate,
            startMinute: session.startMinute,
            endMinute: session.endMinute,
            message,
            bookedPlayers: session.bookedPlayers,
            remainingPlayers: session.remainingCapacity,
          }),
        });
      } catch (err) {
        console.error("[group-slot-post]", err);
      }
    }
  }
}

export async function syncGroupSlotPostsForBooking(bookingId: string) {
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("venue_id, booking_date, share_to_group, status")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking?.venue_id || booking.status !== "confirmed") return;
  if (booking.share_to_group === false) return;
  await syncGroupSlotPostsForVenueDay(booking.venue_id, booking.booking_date);
}

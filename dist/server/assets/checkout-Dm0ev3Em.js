import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { d as bookingStartMinute, a as bookingEndMinute, m as iterateBookingMinutes, h as formatSlotRange, o as slotStepMinutes } from "./slot-time-DELf3klw.js";
import { i as isRazorpayConfigured, c as createRazorpayOrder, v as verifyRazorpayPaymentSignature } from "./razorpay-DwVM9bks.js";
function minuteLoad(minute, bookings, stepMinutes) {
  let load = 0;
  for (const b of bookings) {
    const start = bookingStartMinute(b);
    const end = bookingEndMinute(b);
    if (minute >= start && minute < end) {
      load += Math.max(1, b.player_count ?? 1);
    }
  }
  return load;
}
function buildVenueDaySessions(bookings, totalCapacity, stepMinutes) {
  const active = bookings.filter((b) => b.status !== "cancelled");
  if (active.length === 0) return [];
  const boundaries = /* @__PURE__ */ new Set();
  for (const b of active) {
    boundaries.add(bookingStartMinute(b));
    boundaries.add(bookingEndMinute(b));
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const sessions = [];
  for (let i = 0; i < points.length - 1; i++) {
    const startMinute = points[i];
    const endMinute = points[i + 1];
    if (endMinute <= startMinute) continue;
    const overlapping = active.filter((b) => {
      const bStart = bookingStartMinute(b);
      const bEnd = bookingEndMinute(b);
      return bStart < endMinute && bEnd > startMinute;
    });
    if (overlapping.length === 0) continue;
    let peakBooked = 0;
    iterateBookingMinutes(startMinute, endMinute, stepMinutes, (m) => {
      peakBooked = Math.max(peakBooked, minuteLoad(m, active));
    });
    const remainingCapacity = Math.max(0, totalCapacity - peakBooked);
    const isFullTurf = peakBooked >= totalCapacity;
    const isOpenLobby = overlapping.some((b) => b.is_open_lobby);
    const prev = sessions[sessions.length - 1];
    const sameLoad = prev && prev.endMinute === startMinute && prev.bookedPlayers === peakBooked && prev.isOpenLobby === isOpenLobby && prev.isFullTurf === isFullTurf;
    if (sameLoad) {
      prev.endMinute = endMinute;
      for (const b of overlapping) {
        if (b.id && !prev.bookingIds.includes(b.id)) prev.bookingIds.push(b.id);
      }
      prev.remainingCapacity = remainingCapacity;
      prev.individualEntryAllowed = remainingCapacity > 0 && !isFullTurf;
      continue;
    }
    sessions.push({
      startMinute,
      endMinute,
      bookedPlayers: peakBooked,
      totalCapacity,
      remainingCapacity,
      individualEntryAllowed: remainingCapacity > 0 && !isFullTurf,
      isOpenLobby,
      bookingIds: overlapping.map((b) => b.id).filter(Boolean),
      isFullTurf
    });
  }
  return sessions;
}
function suggestBookingAlternatives(startMinute, endMinute, playerCount, sessions, stepMinutes) {
  const overlapping = sessions.filter(
    (s) => s.startMinute < endMinute && s.endMinute > startMinute && s.bookedPlayers > 0
  );
  if (overlapping.length === 0) return [];
  const suggestions = [];
  const joinTarget = overlapping.find(
    (s) => s.individualEntryAllowed && s.remainingCapacity >= playerCount
  );
  if (joinTarget) {
    suggestions.push({
      type: "join",
      title: `Join the ${formatSlotRange(joinTarget.startMinute, joinTarget.endMinute)} game`,
      description: `${joinTarget.remainingCapacity} spot${joinTarget.remainingCapacity === 1 ? "" : "s"} left (${joinTarget.bookedPlayers}/${joinTarget.totalCapacity} players). Book an individual spot in the same window instead of overlapping.`,
      startMinute: joinTarget.startMinute,
      endMinute: joinTarget.endMinute,
      bookingId: joinTarget.bookingIds[0],
      remainingCapacity: joinTarget.remainingCapacity
    });
  }
  const conflictEnd = Math.max(...overlapping.map((s) => s.endMinute));
  const duration = endMinute - startMinute;
  if (conflictEnd > startMinute && conflictEnd < endMinute) {
    suggestions.push({
      type: "reschedule",
      title: `Book from ${formatSlotRange(conflictEnd, conflictEnd + duration).split(" – ")[0]} instead`,
      description: `Your selection overlaps an existing booking. The nearest open start after it is ${formatSlotRange(conflictEnd, conflictEnd + duration)}.`,
      startMinute: conflictEnd,
      endMinute: conflictEnd + duration
    });
  } else if (conflictEnd > startMinute && !joinTarget) {
    suggestions.push({
      type: "reschedule",
      title: `Try from ${formatSlotRange(conflictEnd, conflictEnd + duration)}`,
      description: "This window overlaps another booking. Pick a slot that starts when the existing game ends.",
      startMinute: conflictEnd,
      endMinute: conflictEnd + duration
    });
  }
  return suggestions;
}
function slotStartsForSession(startMinute, endMinute, stepMinutes) {
  const starts = [];
  for (let m = startMinute; m < endMinute; m += stepMinutes) starts.push(m);
  return starts;
}
function formatGroupMessage(input) {
  const icon = input.sportIcon ?? "⚽";
  return [
    `${icon} GOOD BOOKIES · ${input.venueName}`,
    `📅 ${input.date} · ${formatSlotRange(input.startMinute, input.endMinute)}`,
    `👥 ${input.bookedPlayers}/${input.totalCapacity} players · ${input.remainingPlayers} spot${input.remainingPlayers === 1 ? "" : "s"} open`,
    `🔗 Book: goodbookies.co.in/venues/${input.venueSlug}`
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
async function syncGroupSlotPostsForVenueDay(venueId, bookingDate) {
  if (!await groupPostsTableReady()) return;
  const { data: venue } = await supabaseAdmin.from("venues").select("id, name, slug, max_players_allowed, slot_duration_minutes, sport:sports(icon)").eq("id", venueId).maybeSingle();
  if (!venue) return;
  const hasShareColumn = await bookingsShareToGroupColumnReady();
  const bookingFields = hasShareColumn ? "id, start_hour, end_hour, start_minute, end_minute, player_count, is_open_lobby, status, share_to_group" : "id, start_hour, end_hour, start_minute, end_minute, player_count, is_open_lobby, status";
  const { data: bookings } = await supabaseAdmin.from("bookings").select(bookingFields).eq("venue_id", venueId).eq("booking_date", bookingDate).in("status", ["confirmed", "pending"]);
  const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
  const totalCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));
  const sessions = buildVenueDaySessions(bookings ?? [], totalCapacity, stepMinutes);
  const sportIcon = venue.sport?.icon;
  for (const session of sessions) {
    if (session.remainingCapacity <= 0) {
      await supabaseAdmin.from("group_slot_posts").delete().eq("venue_id", venueId).eq("booking_date", bookingDate).eq("start_minute", session.startMinute).eq("end_minute", session.endMinute);
      continue;
    }
    const sessionBookings = (bookings ?? []).filter((b) => {
      if (hasShareColumn && b.share_to_group === false) {
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
      remainingPlayers: session.remainingCapacity
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
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      { onConflict: "venue_id,booking_date,start_minute,end_minute" }
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
            remainingPlayers: session.remainingCapacity
          })
        });
      } catch (err) {
        console.error("[group-slot-post]", err);
      }
    }
  }
}
async function syncGroupSlotPostsForBooking(bookingId) {
  const { data: booking } = await supabaseAdmin.from("bookings").select("venue_id, booking_date, share_to_group, status").eq("id", bookingId).maybeSingle();
  if (!booking?.venue_id || booking.status !== "confirmed") return;
  if (booking.share_to_group === false) return;
  await syncGroupSlotPostsForVenueDay(booking.venue_id, booking.booking_date);
}
const MIN_ORDER_PAISE = 100;
async function createCheckoutOrder(input) {
  if (input.amountPaise < MIN_ORDER_PAISE) {
    throw new CheckoutError("Amount must be at least 100 paise (₹1)", 400);
  }
  if (!isRazorpayConfigured()) {
    throw new CheckoutError("Razorpay is not configured", 401);
  }
  const order = await createRazorpayOrder(input.amountPaise, input.receipt, input.currency ?? "INR");
  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency
  };
}
async function verifyCheckoutPayment(input) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId, userId } = input;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new CheckoutError("Missing payment verification fields", 400);
  }
  if (!isRazorpayConfigured()) {
    throw new CheckoutError("Razorpay is not configured", 401);
  }
  const valid = verifyRazorpayPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature
  });
  if (!valid) {
    throw new CheckoutError("Invalid payment signature", 400);
  }
  if (bookingId) {
    if (!userId) throw new CheckoutError("Unauthorized", 401);
    await confirmBookingAfterPayment({
      bookingId,
      userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });
  }
  return { success: true };
}
async function confirmBookingAfterPayment(input) {
  const { data: booking, error: bookingErr } = await supabaseAdmin.from("bookings").select("id, user_id, venue_id, booking_date, status, payment_id, coupon_code, venue:venues(owner_id)").eq("id", input.bookingId).maybeSingle();
  if (bookingErr || !booking) throw new CheckoutError("Booking not found", 404);
  if (booking.user_id !== input.userId) throw new CheckoutError("Unauthorized", 401);
  if (booking.status === "confirmed") {
    return { bookingId: booking.id, status: "confirmed" };
  }
  if (booking.status !== "pending") {
    throw new CheckoutError("Booking cannot be paid for in its current state", 400);
  }
  if (!booking.payment_id) throw new CheckoutError("No payment linked to booking", 400);
  const { data: payment, error: payErr } = await supabaseAdmin.from("payments").select("id, razorpay_order_id, status").eq("id", booking.payment_id).maybeSingle();
  if (payErr || !payment) throw new CheckoutError("Payment record not found", 404);
  if (payment.razorpay_order_id !== input.razorpayOrderId) {
    throw new CheckoutError("Order ID does not match this booking", 400);
  }
  if (payment.status === "success") {
    return { bookingId: booking.id, status: "confirmed" };
  }
  const { error: payUpdateErr } = await supabaseAdmin.from("payments").update({
    status: "success",
    razorpay_payment_id: input.razorpayPaymentId
  }).eq("id", payment.id);
  if (payUpdateErr) throw new CheckoutError(payUpdateErr.message, 500);
  const { error: bookingUpdateErr } = await supabaseAdmin.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
  if (bookingUpdateErr) throw new CheckoutError(bookingUpdateErr.message, 500);
  if (booking.coupon_code) {
    const { data: coupon } = await supabaseAdmin.from("coupons").select("id, used_count").eq("code", booking.coupon_code).maybeSingle();
    if (coupon) {
      await supabaseAdmin.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("id", coupon.id);
    }
  }
  await supabaseAdmin.from("notifications").insert({
    user_id: input.userId,
    title: "Booking confirmed",
    message: `Payment received. Your slot on ${booking.booking_date} is confirmed. See you on the turf!`,
    type: "booking"
  });
  const ownerId = booking.venue?.owner_id;
  if (ownerId) {
    await supabaseAdmin.from("notifications").insert({
      user_id: ownerId,
      title: "New booking",
      message: `New confirmed booking on ${booking.booking_date}.`,
      type: "booking"
    });
  }
  await syncGroupSlotPostsForBooking(booking.id);
  return { bookingId: booking.id, status: "confirmed" };
}
class CheckoutError extends Error {
  status;
  constructor(message, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}
export {
  CheckoutError as C,
  MIN_ORDER_PAISE as M,
  suggestBookingAlternatives as a,
  buildVenueDaySessions as b,
  createCheckoutOrder as c,
  syncGroupSlotPostsForBooking as d,
  slotStartsForSession as s,
  verifyCheckoutPayment as v
};

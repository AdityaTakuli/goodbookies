import { c as createServerRpc } from "./createServerRpc-B9MDoVgl.js";
import { l as createServerFn } from "./server-Cz7outt5.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DNN0xV3Z.js";
import { r as resolveMinBookingMinutes, l as loadVenuePricing, c as calculateBookingTotal, a as computeBookingCharge } from "./venue-extras-CCPlaewd.js";
import { M as MIN_ORDER_PAISE } from "./checkout-B66VBp1z.js";
import { i as isRazorpayConfigured, c as createRazorpayOrder } from "./razorpay-DwVM9bks.js";
import { n as slotStepMinutes, o as venueOpenMinutes, v as venueCloseMinutes, d as bookingStartMinute, a as bookingEndMinute, m as iterateBookingMinutes, k as isMinuteBlocked, g as formatMinBookingDuration, i as formatSlotTime } from "./slot-time-B-rvYjC-.js";
import { o as objectType, s as stringType, n as numberType, c as booleanType, b as arrayType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
import "node:crypto";
let reviewCountColumnReady = null;
async function venueHasReviewCountColumn() {
  if (reviewCountColumnReady != null) return reviewCountColumnReady;
  const {
    error
  } = await supabaseAdmin.from("venues").select("review_count").limit(1);
  reviewCountColumnReady = !error?.message?.includes("review_count");
  return reviewCountColumnReady;
}
const VENUE_CARD_FIELDS = "id, name, slug, description, address, city, image_url, price_per_hour, rating, amenities, sport:sports(name, slug, icon)";
const VENUE_DETAIL_FIELDS = "id, name, slug, description, address, city, image_url, price_per_hour, opening_hour, closing_hour, slot_duration_minutes, max_players_allowed, venue_type, amenities, rating, owner_id, sport:sports(name, slug, icon)";
const VENUE_DETAIL_FIELDS_EXTENDED = `${VENUE_DETAIL_FIELDS}, map_url, area_sq_ft, water_available`;
let venueDetailFieldsReady = null;
let bookingMinuteColumnsReady = null;
async function venueHasBookingMinuteColumns() {
  if (bookingMinuteColumnsReady != null) return bookingMinuteColumnsReady;
  const {
    error
  } = await supabaseAdmin.from("bookings").select("start_minute, end_minute").limit(1);
  bookingMinuteColumnsReady = !error?.message?.includes("start_minute");
  return bookingMinuteColumnsReady;
}
async function venueDetailSelectFields() {
  if (venueDetailFieldsReady != null) {
    return venueDetailFieldsReady ? VENUE_DETAIL_FIELDS_EXTENDED : VENUE_DETAIL_FIELDS;
  }
  const {
    error
  } = await supabaseAdmin.from("venues").select("map_url, area_sq_ft, water_available").limit(1);
  venueDetailFieldsReady = !error?.message?.includes("map_url");
  return venueDetailFieldsReady ? VENUE_DETAIL_FIELDS_EXTENDED : VENUE_DETAIL_FIELDS;
}
function withReviewCount(row) {
  return {
    ...row,
    review_count: Number(row.review_count ?? 0)
  };
}
const defaultSports = [{
  name: "Football",
  slug: "football",
  icon: "⚽",
  is_active: true
}, {
  name: "Cricket",
  slug: "cricket",
  icon: "🏏",
  is_active: true
}, {
  name: "Badminton",
  slug: "badminton",
  icon: "🏸",
  is_active: true
}, {
  name: "Basketball",
  slug: "basketball",
  icon: "🏀",
  is_active: true
}];
const listSports_createServerFn_handler = createServerRpc({
  id: "2d1911b40cea4595f28876660194baf9f2564e65120b302149213d9a488d877b",
  name: "listSports",
  filename: "src/lib/booking.functions.ts"
}, (opts) => listSports.__executeServer(opts));
const listSports = createServerFn({
  method: "GET"
}).handler(listSports_createServerFn_handler, async () => {
  let {
    data,
    error
  } = await supabaseAdmin.from("sports").select("id, name, slug, icon").eq("is_active", true).order("name");
  if (error) throw new Error(error.message);
  if (!data?.length) {
    const {
      error: seedErr
    } = await supabaseAdmin.from("sports").upsert(defaultSports, {
      onConflict: "slug"
    });
    if (seedErr) throw new Error(seedErr.message);
    const seeded = await supabaseAdmin.from("sports").select("id, name, slug, icon").eq("is_active", true).order("name");
    if (seeded.error) throw new Error(seeded.error.message);
    data = seeded.data;
  }
  return data ?? [];
});
const listVenues_createServerFn_handler = createServerRpc({
  id: "e61be094150d464993f30fda46fdd05ec3ee0956cec4523b10372fd5235d54fd",
  name: "listVenues",
  filename: "src/lib/booking.functions.ts"
}, (opts) => listVenues.__executeServer(opts));
const listVenues = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  sport: stringType().min(1).max(64).optional()
}).parse(input ?? {})).handler(listVenues_createServerFn_handler, async ({
  data
}) => {
  const fields = await venueHasReviewCountColumn() ? `${VENUE_CARD_FIELDS.replace("rating,", "rating, review_count,")}` : VENUE_CARD_FIELDS;
  let query = supabaseAdmin.from("venues").select(fields).eq("is_active", true).eq("approval_status", "approved").order("rating", {
    ascending: false
  });
  if (data.sport) {
    const {
      data: s
    } = await supabaseAdmin.from("sports").select("id").eq("slug", data.sport).maybeSingle();
    if (s?.id) query = query.eq("sport_id", s.id);
  }
  const {
    data: rows,
    error
  } = await query;
  if (error) throw new Error(error.message);
  return (rows ?? []).map((row) => withReviewCount(row));
});
const getVenue_createServerFn_handler = createServerRpc({
  id: "a894368827ec13220f8e161064d474273c6d1f34afa7142b981ee25460a2e459",
  name: "getVenue",
  filename: "src/lib/booking.functions.ts"
}, (opts) => getVenue.__executeServer(opts));
const getVenue = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  slug: stringType().min(1).max(120)
}).parse(input)).handler(getVenue_createServerFn_handler, async ({
  data
}) => {
  const baseFields = await venueDetailSelectFields();
  const fields = await venueHasReviewCountColumn() ? `${baseFields.replace("rating,", "rating, review_count,")}` : baseFields;
  const {
    data: venue,
    error
  } = await supabaseAdmin.from("venues").select(fields).eq("slug", data.slug).eq("is_active", true).eq("approval_status", "approved").maybeSingle();
  if (error) throw new Error(error.message);
  return venue ? withReviewCount(venue) : null;
});
const getSlots_createServerFn_handler = createServerRpc({
  id: "233e36323445af8501bc4a10d6522cf1d74f1c6ab3d242d95184c1424c53f3d5",
  name: "getSlots",
  filename: "src/lib/booking.functions.ts"
}, (opts) => getSlots.__executeServer(opts));
const getSlots = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  playerCount: numberType().int().min(1).max(100).default(1)
}).parse(input)).handler(getSlots_createServerFn_handler, async ({
  data
}) => {
  const {
    data: venue
  } = await supabaseAdmin.from("venues").select("opening_hour, closing_hour, operating_days, holiday_dates, max_players_allowed, slot_duration_minutes").eq("id", data.venueId).maybeSingle();
  if (!venue) throw new Error("Venue not found");
  const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
  const openMin = venueOpenMinutes(venue.opening_hour);
  const closeMin = venueCloseMinutes(venue.closing_hour);
  const dow = (/* @__PURE__ */ new Date(data.date + "T12:00:00")).getDay();
  const holidays = venue.holiday_dates ?? [];
  if (holidays.includes(data.date)) return [];
  const opDays = venue.operating_days ?? [0, 1, 2, 3, 4, 5, 6];
  if (!opDays.includes(dow)) return [];
  const bookingFields = await venueHasBookingMinuteColumns() ? "id, start_hour, end_hour, start_minute, end_minute, status, player_count, is_open_lobby" : "id, start_hour, end_hour, status, player_count, is_open_lobby";
  const [{
    data: bookings
  }, {
    data: blocks
  }] = await Promise.all([supabaseAdmin.from("bookings").select(bookingFields).eq("venue_id", data.venueId).eq("booking_date", data.date).in("status", ["confirmed", "pending"]), supabaseAdmin.from("slot_blocks").select("*").eq("venue_id", data.venueId)]);
  const bookedPlayersByMinute = /* @__PURE__ */ new Map();
  bookings?.forEach((b) => {
    const bStart = bookingStartMinute(b);
    const bEnd = bookingEndMinute(b);
    iterateBookingMinutes(bStart, bEnd, stepMinutes, (m) => {
      bookedPlayersByMinute.set(m, (bookedPlayersByMinute.get(m) ?? 0) + (b.player_count ?? 1));
    });
  });
  const totalCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));
  const openLobbyByMinute = /* @__PURE__ */ new Map();
  bookings?.forEach((b) => {
    if (!b.is_open_lobby) return;
    const bStart = bookingStartMinute(b);
    const bEnd = bookingEndMinute(b);
    iterateBookingMinutes(bStart, bEnd, stepMinutes, (m) => {
      const rem = totalCapacity - (bookedPlayersByMinute.get(m) ?? 0);
      if (rem > 0) openLobbyByMinute.set(m, {
        bookingId: b.id,
        isOpen: true
      });
    });
  });
  const slots = [];
  const requestedPlayers = Math.max(1, data.playerCount ?? 1);
  for (let m = openMin; m < closeMin; m += stepMinutes) {
    const blocked = isMinuteBlocked(m, blocks ?? [], data.date, dow);
    const bookedPlayers = Math.max(0, bookedPlayersByMinute.get(m) ?? 0);
    const remainingCapacity = Math.max(0, totalCapacity - bookedPlayers);
    const full = remainingCapacity <= 0;
    const enoughForSelection = remainingCapacity >= requestedPlayers;
    const hasPartialPrivate = bookedPlayers > 0 && !openLobbyByMinute.has(m);
    slots.push({
      startMinute: m,
      available: !blocked && enoughForSelection,
      status: blocked ? "blocked" : full ? "booked" : bookedPlayers > 0 ? "partial" : "available",
      remaining_capacity: remainingCapacity,
      booked_players: bookedPlayers,
      total_capacity: totalCapacity,
      open_lobby_booking_id: openLobbyByMinute.get(m)?.bookingId ?? null,
      is_private_game: hasPartialPrivate
    });
  }
  return slots;
});
const createBooking_createServerFn_handler = createServerRpc({
  id: "d5d1516df3b15f9b01e23ed40cda22b58728aafe46e1ea4dd526f9df75ede78c",
  name: "createBooking",
  filename: "src/lib/booking.functions.ts"
}, (opts) => createBooking.__executeServer(opts));
const createBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  startMinute: numberType().int().min(0).max(1410),
  endMinute: numberType().int().min(30).max(1440),
  playerCount: numberType().int().min(1).max(100).default(1),
  playerNames: arrayType(stringType().trim().min(1).max(60)).optional(),
  isOpenLobby: booleanType().default(false),
  couponCode: stringType().optional()
}).refine((v) => v.endMinute > v.startMinute, {
  message: "endMinute must be > startMinute"
}).parse(input)).handler(createBooking_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: venue,
    error: vErr
  } = await supabaseAdmin.from("venues").select("slug, price_per_hour, confirmation_mode, owner_id, max_players_allowed, slot_duration_minutes").eq("id", data.venueId).eq("is_active", true).eq("approval_status", "approved").maybeSingle();
  if (vErr || !venue) throw new Error("Venue not found");
  const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
  const minBookingMinutes = resolveMinBookingMinutes(venue);
  if (data.endMinute - data.startMinute < minBookingMinutes) {
    throw new Error(`Minimum booking is ${formatMinBookingDuration(minBookingMinutes)}`);
  }
  if ((data.endMinute - data.startMinute) % stepMinutes !== 0) {
    throw new Error("Invalid slot duration for this turf");
  }
  if (venue.owner_id && venue.owner_id === context.userId) {
    throw new Error("Partners cannot book their own turf. Book other venues as a player, or manage slots from Partner.");
  }
  const maxCap = Math.max(1, Number(venue.max_players_allowed ?? 1));
  if (data.playerCount !== 1 && data.playerCount !== maxCap) {
    throw new Error("Book an individual spot for yourself or reserve the full turf");
  }
  if (data.playerCount > maxCap) {
    throw new Error(`Only ${maxCap} players are allowed for this turf`);
  }
  let normalizedNames = (data.playerNames ?? []).map((name) => name.trim()).filter(Boolean);
  if (normalizedNames.length === 0) {
    const {
      data: profile
    } = await supabaseAdmin.from("profiles").select("full_name, email").eq("id", context.userId).maybeSingle();
    const bookerName = profile?.full_name?.trim() || profile?.email?.split("@")[0] || "Player";
    normalizedNames = [bookerName];
  }
  const {
    data: overlaps,
    error: overlapErr
  } = await supabaseAdmin.from("bookings").select(await venueHasBookingMinuteColumns() ? "start_hour, end_hour, start_minute, end_minute, player_count" : "start_hour, end_hour, player_count").eq("venue_id", data.venueId).eq("booking_date", data.date).in("status", ["confirmed", "pending"]);
  if (overlapErr) throw new Error(overlapErr.message);
  const maxCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));
  iterateBookingMinutes(data.startMinute, data.endMinute, stepMinutes, (m) => {
    const used = (overlaps ?? []).reduce((sum, b) => {
      const bStart = bookingStartMinute(b);
      const bEnd = bookingEndMinute(b);
      if (m >= bStart && m < bEnd) return sum + (b.player_count ?? 1);
      return sum;
    }, 0);
    if (used + data.playerCount > maxCapacity) {
      throw new Error(`Not enough capacity at ${formatSlotTime(m)}. Please pick another slot.`);
    }
  });
  const pricing = await loadVenuePricing(data.venueId);
  let coupon = null;
  if (data.couponCode) {
    const {
      data: c
    } = await supabaseAdmin.from("coupons").select("*").eq("code", data.couponCode.toUpperCase()).eq("is_active", true).maybeSingle();
    if (c && (!c.venue_id || c.venue_id === data.venueId)) coupon = c;
  }
  const total = calculateBookingTotal({
    basePricePerHour: venue.price_per_hour,
    bookingDate: data.date,
    startMinute: data.startMinute,
    endMinute: data.endMinute,
    slotStepMinutes: stepMinutes,
    dayPricing: pricing.dayPricing,
    datePricing: pricing.datePricing,
    peakRules: pricing.peakRules,
    durationDiscounts: pricing.durationDiscounts,
    coupon: coupon ? {
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    } : null
  });
  const openLobby = false;
  const {
    charge: chargeAmount
  } = computeBookingCharge(total, maxCap, data.playerCount);
  const amountPaise = chargeAmount * 100;
  const requiresPayment = isRazorpayConfigured() && amountPaise >= MIN_ORDER_PAISE;
  const status = requiresPayment ? "pending" : "confirmed";
  const order = await createRazorpayOrder(amountPaise, `bk_${Date.now()}`);
  const {
    data: payment,
    error: payErr
  } = await supabaseAdmin.from("payments").insert({
    user_id: context.userId,
    amount: chargeAmount,
    razorpay_order_id: order.id,
    status: requiresPayment ? "created" : "success"
  }).select("id").single();
  if (payErr) throw new Error(payErr.message);
  const bookingInsert = {
    user_id: context.userId,
    venue_id: data.venueId,
    booking_date: data.date,
    player_count: data.playerCount,
    player_names: normalizedNames,
    is_open_lobby: openLobby,
    total_price: total,
    status,
    coupon_code: data.couponCode?.toUpperCase() ?? null,
    payment_id: payment.id
  };
  if (await venueHasBookingMinuteColumns()) {
    bookingInsert.start_hour = Math.floor(data.startMinute / 60);
    bookingInsert.end_hour = Math.ceil(data.endMinute / 60);
    bookingInsert.start_minute = data.startMinute;
    bookingInsert.end_minute = data.endMinute;
  } else {
    bookingInsert.start_hour = data.startMinute;
    bookingInsert.end_hour = data.endMinute;
  }
  const {
    data: booking,
    error
  } = await context.supabase.from("bookings").insert(bookingInsert).select("id").single();
  if (error) throw new Error(error.message.includes("bookings_no_double_book") ? "One of those slots was just booked. Pick another." : error.message);
  await supabaseAdmin.from("payments").update({
    booking_id: booking.id
  }).eq("id", payment.id);
  if (coupon && !requiresPayment) {
    await supabaseAdmin.from("coupons").update({
      used_count: (coupon.used_count ?? 0) + 1
    }).eq("id", coupon.id);
  }
  if (!requiresPayment) {
    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      title: "Booking confirmed",
      message: `Your slot on ${data.date} is confirmed. See you on the turf!`,
      type: "booking"
    });
    if (venue.owner_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: venue.owner_id,
        title: "New booking",
        message: `New confirmed booking on ${data.date}.`,
        type: "booking"
      });
    }
  }
  return {
    bookingId: booking.id,
    total: chargeAmount,
    fullTotal: total,
    amountPaise,
    razorpayOrderId: order.id,
    razorpayKeyId: process.env.VITE_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? null,
    requiresPayment,
    status,
    isOpenLobby: openLobby
  };
});
const listMyBookings_createServerFn_handler = createServerRpc({
  id: "d1db1769e805004b7650e52069e0692b745a7216b3ba175af8cd5c999b2ea22f",
  name: "listMyBookings",
  filename: "src/lib/booking.functions.ts"
}, (opts) => listMyBookings.__executeServer(opts));
const listMyBookings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyBookings_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("bookings").select("id, booking_date, start_hour, end_hour, player_count, player_names, is_open_lobby, total_price, status, venue:venues(name, slug, image_url, city, max_players_allowed, sport:sports(name, icon))").order("booking_date", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
export {
  createBooking_createServerFn_handler,
  getSlots_createServerFn_handler,
  getVenue_createServerFn_handler,
  listMyBookings_createServerFn_handler,
  listSports_createServerFn_handler,
  listVenues_createServerFn_handler
};

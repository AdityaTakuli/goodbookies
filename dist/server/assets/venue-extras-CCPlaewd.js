import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
function parseTimeToHour(t) {
  const [h, m = "0"] = t.split(":");
  return Number(h) + Number(m) / 60;
}
function hourInRange(hour, start, end) {
  const sh = parseTimeToHour(start);
  const eh = parseTimeToHour(end);
  if (sh <= eh) return hour >= sh && hour < eh;
  return hour >= sh || hour < eh;
}
function hourlyRateForSlot(ctx, hour) {
  const dow = (/* @__PURE__ */ new Date(ctx.bookingDate + "T12:00:00")).getDay();
  let rate = ctx.basePricePerHour;
  const dateOverride = ctx.datePricing?.find((d) => d.date === ctx.bookingDate);
  if (dateOverride) rate = dateOverride.price_override;
  const dayOverride = ctx.dayPricing?.find((d) => d.day_of_week === dow);
  if (dayOverride && !dateOverride) rate = dayOverride.price_override;
  for (const peak of ctx.peakRules ?? []) {
    if (peak.day_of_week != null && peak.day_of_week !== dow) continue;
    if (!hourInRange(hour, peak.start_time, peak.end_time)) continue;
    if (peak.surcharge_type === "flat") rate += Number(peak.surcharge_value);
    else rate += Math.round(rate * (Number(peak.surcharge_value) / 100));
  }
  return rate;
}
function calculateBookingTotal(ctx) {
  const step = ctx.slotStepMinutes ?? 60;
  let subtotal = 0;
  for (let m = ctx.startMinute; m < ctx.endMinute; m += step) {
    const hour = m / 60;
    subtotal += hourlyRateForSlot(ctx, hour) * (step / 60);
  }
  const hours = (ctx.endMinute - ctx.startMinute) / 60;
  let discountPct = 0;
  for (const d of ctx.durationDiscounts ?? []) {
    if (hours >= d.min_hours) discountPct = Math.max(discountPct, Number(d.discount_percent));
  }
  subtotal = Math.round(subtotal * (1 - discountPct / 100));
  if (ctx.coupon) {
    if (ctx.coupon.discount_type === "flat") subtotal = Math.max(0, subtotal - Number(ctx.coupon.discount_value));
    else subtotal = Math.max(0, Math.round(subtotal * (1 - Number(ctx.coupon.discount_value) / 100)));
  }
  return subtotal;
}
const INDIVIDUAL_BOOKING_SURCHARGE = 0.15;
function computeBookingCharge(slotTotal, maxPlayers, playerCount) {
  const max = Math.max(1, maxPlayers);
  const perPersonBase = slotTotal > 0 ? Math.ceil(slotTotal / max) : 0;
  const isFullTurf = playerCount >= max;
  if (isFullTurf) {
    return { charge: slotTotal, perPersonBase, isFullTurf: true };
  }
  const charge = Math.ceil(perPersonBase * (1 + INDIVIDUAL_BOOKING_SURCHARGE));
  return { charge, perPersonBase, isFullTurf: false };
}
async function loadVenuePricing(venueId) {
  const [peak, day, date, duration] = await Promise.all([
    supabaseAdmin.from("venue_peak_pricing").select("*").eq("venue_id", venueId),
    supabaseAdmin.from("venue_day_pricing").select("*").eq("venue_id", venueId),
    supabaseAdmin.from("venue_date_pricing").select("*").eq("venue_id", venueId),
    supabaseAdmin.from("venue_duration_discounts").select("*").eq("venue_id", venueId)
  ]);
  return {
    peakRules: peak.data ?? [],
    dayPricing: day.data ?? [],
    datePricing: date.data ?? [],
    durationDiscounts: duration.data ?? []
  };
}
const VENUE_EXTRAS = {
  "yorker-yard-rectangular": {
    map_url: "https://maps.app.goo.gl/vVjrCR1oKQUhu4ks6",
    area_sq_ft: 7e3,
    water_available: "Yes (paid & unpaid)",
    min_booking_minutes: 60
  },
  "yorker-yard-oval-360": {
    map_url: "https://maps.app.goo.gl/RYbitkFExqU65NCa6",
    area_sq_ft: 15600,
    water_available: "Yes (paid & unpaid)",
    min_booking_minutes: 60
  }
};
function resolveMinBookingMinutes(venue) {
  const extra = VENUE_EXTRAS[venue.slug];
  return venue.min_booking_minutes ?? extra?.min_booking_minutes ?? venue.slot_duration_minutes ?? 60;
}
function withVenueExtras(venue) {
  const extra = VENUE_EXTRAS[venue.slug];
  if (!extra) return venue;
  return {
    ...venue,
    map_url: extra.map_url ?? venue.map_url,
    area_sq_ft: venue.area_sq_ft ?? extra.area_sq_ft,
    water_available: venue.water_available ?? extra.water_available,
    min_booking_minutes: venue.min_booking_minutes ?? extra.min_booking_minutes
  };
}
export {
  INDIVIDUAL_BOOKING_SURCHARGE as I,
  computeBookingCharge as a,
  calculateBookingTotal as c,
  loadVenuePricing as l,
  resolveMinBookingMinutes as r,
  withVenueExtras as w
};

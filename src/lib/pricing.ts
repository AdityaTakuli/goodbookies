import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Compute hourly rate and total for a booking window. */
export type PricingContext = {
  basePricePerHour: number;
  bookingDate: string;
  startHour: number;
  endHour: number;
  dayPricing?: { day_of_week: number; price_override: number }[];
  datePricing?: { date: string; price_override: number }[];
  peakRules?: {
    day_of_week: number | null;
    start_time: string;
    end_time: string;
    surcharge_type: string;
    surcharge_value: number;
  }[];
  durationDiscounts?: { min_hours: number; discount_percent: number }[];
  coupon?: { discount_type: string; discount_value: number } | null;
};

function parseTimeToHour(t: string): number {
  const [h] = t.split(":");
  return Number(h);
}

function hourInRange(hour: number, start: string, end: string): boolean {
  const sh = parseTimeToHour(start);
  const eh = parseTimeToHour(end);
  if (sh <= eh) return hour >= sh && hour < eh;
  return hour >= sh || hour < eh;
}

export function hourlyRateForSlot(ctx: PricingContext, hour: number): number {
  const dow = new Date(ctx.bookingDate + "T12:00:00").getDay();
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

export function calculateBookingTotal(ctx: PricingContext): number {
  let subtotal = 0;
  for (let h = ctx.startHour; h < ctx.endHour; h++) {
    subtotal += hourlyRateForSlot(ctx, h);
  }

  const hours = ctx.endHour - ctx.startHour;
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

export async function loadVenuePricing(venueId: string) {
  const [peak, day, date, duration] = await Promise.all([
    supabaseAdmin.from("venue_peak_pricing").select("*").eq("venue_id", venueId),
    supabaseAdmin.from("venue_day_pricing").select("*").eq("venue_id", venueId),
    supabaseAdmin.from("venue_date_pricing").select("*").eq("venue_id", venueId),
    supabaseAdmin.from("venue_duration_discounts").select("*").eq("venue_id", venueId),
  ]);
  return {
    peakRules: peak.data ?? [],
    dayPricing: day.data ?? [],
    datePricing: date.data ?? [],
    durationDiscounts: duration.data ?? [],
  };
}

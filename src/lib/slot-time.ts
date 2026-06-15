/** Slot times are minutes from midnight (0 = 12:00 AM, 750 = 12:30 PM). */

export function slotStepMinutes(slotDurationMinutes?: number | null) {
  const step = slotDurationMinutes ?? 60;
  return step === 30 ? 30 : 60;
}

export function formatSlotTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatSlotRange(startMinute: number, endMinute: number) {
  return `${formatSlotTime(startMinute)} – ${formatSlotTime(endMinute)}`;
}

/** Legacy rows store whole hours (0–24). New rows may store minutes from midnight in start_hour when > 24. */
export function bookingStartMinute(row: { start_hour: number; start_minute?: number | null }) {
  if (row.start_minute != null) return row.start_minute;
  if (row.start_hour > 24) return row.start_hour;
  return row.start_hour * 60;
}

export function bookingEndMinute(row: { end_hour: number; end_minute?: number | null }) {
  if (row.end_minute != null) return row.end_minute;
  if (row.end_hour > 24) return row.end_hour;
  return row.end_hour * 60;
}

export function venueOpenMinutes(openingHour: number) {
  return openingHour * 60;
}

export function venueCloseMinutes(closingHour: number) {
  return closingHour * 60;
}

export function isContiguousSlots(selected: number[], stepMinutes: number) {
  const sorted = [...selected].sort((a, b) => a - b);
  return sorted.every((m, i) => i === 0 || m === sorted[i - 1] + stepMinutes);
}

export function selectionEndFromSlots(slotStarts: number[], stepMinutes: number) {
  if (slotStarts.length === 0) return null;
  return slotStarts[slotStarts.length - 1] + stepMinutes;
}

/** Highlight tiles for a confirmed booking (includes end-time tile). */
export function visualHighlightForSlots(slotStarts: number[], stepMinutes: number) {
  if (slotStarts.length === 0) return [];
  return visualTilesFromAnchors(slotStarts[0], selectionEndFromSlots(slotStarts, stepMinutes)!, stepMinutes);
}

/** All tile start times to highlight: start tap, end tap, and every tile between (inclusive). */
export function visualTilesFromAnchors(anchorA: number, anchorB: number, stepMinutes: number) {
  const lo = Math.min(anchorA, anchorB);
  const hi = Math.max(anchorA, anchorB);
  const out: number[] = [];
  for (let m = lo; m <= hi; m += stepMinutes) out.push(m);
  return out;
}

/**
 * Build booking from two time taps: duration = end − start (end time is exclusive for billing).
 * e.g. 4:30 AM → 5:00 AM = 30 min · 11:00 AM → 12:30 PM = 90 min (1.5 h).
 */
export function bookingRangeFromAnchors(
  startAnchor: number,
  endAnchor: number,
  stepMinutes: number,
) {
  if (endAnchor === startAnchor) {
    return {
      startMinute: startAnchor,
      endMinute: startAnchor + stepMinutes,
      durationMinutes: stepMinutes,
      slotStarts: [startAnchor],
    };
  }
  const startMinute = Math.min(startAnchor, endAnchor);
  const endMinute = Math.max(startAnchor, endAnchor);
  const durationMinutes = endMinute - startMinute;
  const slotStarts: number[] = [];
  for (let m = startMinute; m < endMinute; m += stepMinutes) slotStarts.push(m);
  return { startMinute, endMinute, durationMinutes, slotStarts };
}

/** @deprecated use bookingRangeFromAnchors */
export function slotRangeFromAnchors(anchorA: number, anchorB: number, stepMinutes: number) {
  return bookingRangeFromAnchors(anchorA, anchorB, stepMinutes).slotStarts;
}

export function slotRangeEndMinute(range: number[], stepMinutes: number) {
  if (range.length === 0) return 0;
  return range[range.length - 1] + stepMinutes;
}

export function bookingDurationHours(durationMinutes: number) {
  return durationMinutes / 60;
}

export function isRangeAvailable(
  minutes: number[],
  availableMinutes: Set<number>,
) {
  return minutes.length > 0 && minutes.every((m) => availableMinutes.has(m));
}

export function slotPriceTotal(pricePerHour: number, slotCount: number, stepMinutes: number) {
  return Math.round(pricePerHour * slotCount * (stepMinutes / 60));
}

export function slotDurationHours(slotCount: number, stepMinutes: number) {
  return (slotCount * stepMinutes) / 60;
}

export function parseBlockTimeToMinutes(time: string) {
  const [h, m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m);
}

export function isMinuteBlocked(
  minute: number,
  blocks: {
    is_recurring?: boolean | null;
    recurrence_day?: number | null;
    block_date?: string | null;
    start_time: string;
    end_time: string;
  }[],
  date: string,
  dow: number,
) {
  for (const bl of blocks) {
    const sh = parseBlockTimeToMinutes(String(bl.start_time));
    const eh = parseBlockTimeToMinutes(String(bl.end_time));
    if (bl.is_recurring && bl.recurrence_day === dow && minute >= sh && minute < eh) return true;
    if (bl.block_date === date && minute >= sh && minute < eh) return true;
  }
  return false;
}

export function formatBookingSlotLabel(row: {
  start_hour: number;
  end_hour: number;
  start_minute?: number | null;
  end_minute?: number | null;
}) {
  return formatSlotRange(bookingStartMinute(row), bookingEndMinute(row));
}

export function formatBookingStartLabel(row: {
  start_hour: number;
  start_minute?: number | null;
}) {
  return formatSlotTime(bookingStartMinute(row));
}

/** Format duration for display (e.g. 60 → "1 hour"). */
export function formatMinBookingDuration(minutes?: number | null) {
  if (!minutes) return null;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${minutes} minutes`;
}

export function iterateBookingMinutes(
  startMinute: number,
  endMinute: number,
  stepMinutes: number,
  fn: (minute: number) => void,
) {
  for (let m = startMinute; m < endMinute; m += stepMinutes) fn(m);
}

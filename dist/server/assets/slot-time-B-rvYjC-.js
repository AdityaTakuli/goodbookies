function slotStepMinutes(slotDurationMinutes) {
  const step = slotDurationMinutes ?? 60;
  return step === 30 ? 30 : 60;
}
function formatSlotTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}
function formatSlotRange(startMinute, endMinute) {
  return `${formatSlotTime(startMinute)} – ${formatSlotTime(endMinute)}`;
}
function bookingStartMinute(row) {
  if (row.start_minute != null) return row.start_minute;
  if (row.start_hour > 24) return row.start_hour;
  return row.start_hour * 60;
}
function bookingEndMinute(row) {
  if (row.end_minute != null) return row.end_minute;
  if (row.end_hour > 24) return row.end_hour;
  return row.end_hour * 60;
}
function venueOpenMinutes(openingHour) {
  return openingHour * 60;
}
function venueCloseMinutes(closingHour) {
  return closingHour * 60;
}
function isContiguousSlots(selected, stepMinutes) {
  const sorted = [...selected].sort((a, b) => a - b);
  return sorted.every((m, i) => i === 0 || m === sorted[i - 1] + stepMinutes);
}
function visualTilesFromAnchors(anchorA, anchorB, stepMinutes) {
  const lo = Math.min(anchorA, anchorB);
  const hi = Math.max(anchorA, anchorB);
  const out = [];
  for (let m = lo; m <= hi; m += stepMinutes) out.push(m);
  return out;
}
function bookingRangeFromAnchors(startAnchor, endAnchor, stepMinutes) {
  if (endAnchor === startAnchor) {
    return {
      startMinute: startAnchor,
      endMinute: startAnchor + stepMinutes,
      durationMinutes: stepMinutes,
      slotStarts: [startAnchor]
    };
  }
  const startMinute = Math.min(startAnchor, endAnchor);
  const endMinute = Math.max(startAnchor, endAnchor);
  const durationMinutes = endMinute - startMinute;
  const slotStarts = [];
  for (let m = startMinute; m < endMinute; m += stepMinutes) slotStarts.push(m);
  return { startMinute, endMinute, durationMinutes, slotStarts };
}
function bookingDurationHours(durationMinutes) {
  return durationMinutes / 60;
}
function isRangeAvailable(minutes, availableMinutes) {
  return minutes.length > 0 && minutes.every((m) => availableMinutes.has(m));
}
function slotPriceTotal(pricePerHour, slotCount, stepMinutes) {
  return Math.round(pricePerHour * slotCount * (stepMinutes / 60));
}
function parseBlockTimeToMinutes(time) {
  const [h, m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m);
}
function isMinuteBlocked(minute, blocks, date, dow) {
  for (const bl of blocks) {
    const sh = parseBlockTimeToMinutes(String(bl.start_time));
    const eh = parseBlockTimeToMinutes(String(bl.end_time));
    if (bl.is_recurring && bl.recurrence_day === dow && minute >= sh && minute < eh) return true;
    if (bl.block_date === date && minute >= sh && minute < eh) return true;
  }
  return false;
}
function formatBookingSlotLabel(row) {
  return formatSlotRange(bookingStartMinute(row), bookingEndMinute(row));
}
function formatBookingStartLabel(row) {
  return formatSlotTime(bookingStartMinute(row));
}
function formatMinBookingDuration(minutes) {
  if (!minutes) return null;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${minutes} minutes`;
}
function iterateBookingMinutes(startMinute, endMinute, stepMinutes, fn) {
  for (let m = startMinute; m < endMinute; m += stepMinutes) fn(m);
}
export {
  bookingEndMinute as a,
  bookingDurationHours as b,
  bookingRangeFromAnchors as c,
  bookingStartMinute as d,
  formatBookingStartLabel as e,
  formatBookingSlotLabel as f,
  formatMinBookingDuration as g,
  formatSlotRange as h,
  formatSlotTime as i,
  isContiguousSlots as j,
  isMinuteBlocked as k,
  isRangeAvailable as l,
  iterateBookingMinutes as m,
  slotStepMinutes as n,
  venueOpenMinutes as o,
  visualTilesFromAnchors as p,
  slotPriceTotal as s,
  venueCloseMinutes as v
};

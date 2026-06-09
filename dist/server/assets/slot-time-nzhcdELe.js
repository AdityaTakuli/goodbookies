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
function slotPriceTotal(pricePerHour, slotCount, stepMinutes) {
  return Math.round(pricePerHour * slotCount * (stepMinutes / 60));
}
function slotDurationHours(slotCount, stepMinutes) {
  return slotCount * stepMinutes / 60;
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
  bookingStartMinute as a,
  bookingEndMinute as b,
  formatBookingStartLabel as c,
  formatMinBookingDuration as d,
  formatSlotTime as e,
  formatBookingSlotLabel as f,
  isMinuteBlocked as g,
  iterateBookingMinutes as h,
  isContiguousSlots as i,
  slotPriceTotal as j,
  slotStepMinutes as k,
  venueOpenMinutes as l,
  slotDurationHours as s,
  venueCloseMinutes as v
};

const CANCEL_FULL_REFUND_HOURS = 3;
const CANCEL_PARTIAL_REFUND_HOURS = 2;
const CANCEL_PARTIAL_REFUND_PERCENT = 50;
function slotStartDate(bookingDate, startMinute) {
  const d = /* @__PURE__ */ new Date(`${bookingDate}T00:00:00`);
  d.setHours(Math.floor(startMinute / 60), startMinute % 60, 0, 0);
  return d;
}
function hoursUntilSlot(bookingDate, startMinute) {
  return (slotStartDate(bookingDate, startMinute).getTime() - Date.now()) / (1e3 * 60 * 60);
}
function cancellationRefundPercent(hoursUntil) {
  if (hoursUntil < CANCEL_PARTIAL_REFUND_HOURS) return null;
  if (hoursUntil >= CANCEL_FULL_REFUND_HOURS) return 100;
  return CANCEL_PARTIAL_REFUND_PERCENT;
}
const CANCELLATION_POLICY_SHORT = "100% refund if cancelled more than 3 hours before your slot; 50% refund between 2–3 hours before; no cancellation or refund within 2 hours of your slot.";
export {
  CANCELLATION_POLICY_SHORT as C,
  CANCEL_FULL_REFUND_HOURS as a,
  CANCEL_PARTIAL_REFUND_HOURS as b,
  CANCEL_PARTIAL_REFUND_PERCENT as c,
  cancellationRefundPercent as d,
  hoursUntilSlot as h
};

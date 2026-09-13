const CANCEL_FULL_REFUND_HOURS = 24;
const CANCEL_PARTIAL_REFUND_HOURS = 12;
const CANCEL_PARTIAL_REFUND_PERCENT = 50;
const CANCEL_CONVENIENCE_FEE_PERCENT = 10;
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
function refundPaiseForCancellation(paidAmountRupees, refundPercent) {
  const paidPaise = Math.round(paidAmountRupees * 100);
  if (refundPercent >= 100) return paidPaise;
  const baseRefund = Math.round(paidPaise * (refundPercent / 100));
  const convenience = Math.round(paidPaise * (CANCEL_CONVENIENCE_FEE_PERCENT / 100));
  return Math.max(0, baseRefund - convenience);
}
const CANCELLATION_POLICY_SHORT = "100% refund if cancelled more than 24 hours before your slot; 50% refund (minus 10% convenience fee) between 12–24 hours before; no cancellation or refund within 12 hours of your slot.";
export {
  CANCELLATION_POLICY_SHORT as C,
  CANCEL_CONVENIENCE_FEE_PERCENT as a,
  CANCEL_FULL_REFUND_HOURS as b,
  CANCEL_PARTIAL_REFUND_HOURS as c,
  CANCEL_PARTIAL_REFUND_PERCENT as d,
  cancellationRefundPercent as e,
  hoursUntilSlot as h,
  refundPaiseForCancellation as r
};

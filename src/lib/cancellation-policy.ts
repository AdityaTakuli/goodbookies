/** Tiered cancellation & refund windows (hours before slot start). */

export const CANCEL_FULL_REFUND_HOURS = 24;
export const CANCEL_PARTIAL_REFUND_HOURS = 12;
export const CANCEL_PARTIAL_REFUND_PERCENT = 50;
/** Non-refundable convenience portion kept on partial refunds (applied to paid amount). */
export const CANCEL_CONVENIENCE_FEE_PERCENT = 10;

export function slotStartDate(bookingDate: string, startMinute: number): Date {
  const d = new Date(`${bookingDate}T00:00:00`);
  d.setHours(Math.floor(startMinute / 60), startMinute % 60, 0, 0);
  return d;
}

export function hoursUntilSlot(bookingDate: string, startMinute: number): number {
  return (slotStartDate(bookingDate, startMinute).getTime() - Date.now()) / (1000 * 60 * 60);
}

/** null = cancellation not allowed (no refund). */
export function cancellationRefundPercent(hoursUntil: number): number | null {
  if (hoursUntil < CANCEL_PARTIAL_REFUND_HOURS) return null;
  if (hoursUntil >= CANCEL_FULL_REFUND_HOURS) return 100;
  return CANCEL_PARTIAL_REFUND_PERCENT;
}

/**
 * Refund paise after applying convenience fee on non-full refunds.
 * Full refunds (>24h) return 100% of paid amount.
 * Partial refunds (12–24h) return 50% of paid, minus 10% convenience on the original paid amount.
 */
export function refundPaiseForCancellation(paidAmountRupees: number, refundPercent: number): number {
  const paidPaise = Math.round(paidAmountRupees * 100);
  if (refundPercent >= 100) return paidPaise;
  const baseRefund = Math.round(paidPaise * (refundPercent / 100));
  const convenience = Math.round(paidPaise * (CANCEL_CONVENIENCE_FEE_PERCENT / 100));
  return Math.max(0, baseRefund - convenience);
}

export const CANCELLATION_POLICY_SHORT =
  "100% refund if cancelled more than 24 hours before your slot; 50% refund (minus 10% convenience fee) between 12–24 hours before; no cancellation or refund within 12 hours of your slot.";

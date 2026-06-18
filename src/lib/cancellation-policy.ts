/** Tiered cancellation & refund windows (hours before slot start). */

export const CANCEL_FULL_REFUND_HOURS = 3;
export const CANCEL_PARTIAL_REFUND_HOURS = 2;
export const CANCEL_PARTIAL_REFUND_PERCENT = 50;

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

export const CANCELLATION_POLICY_SHORT =
  "100% refund if cancelled more than 3 hours before your slot; 50% refund between 2–3 hours before; no cancellation or refund within 2 hours of your slot.";

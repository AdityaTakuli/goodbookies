import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  bookingDurationHours,
  bookingRangeFromAnchors,
  formatMinBookingDuration,
  formatSlotRange,
  formatSlotTime,
  isRangeAvailable,
  visualHighlightForSlots,
  visualTilesFromAnchors,
} from "@/lib/slot-time";

export type Slot = {
  startMinute: number;
  available: boolean;
  status?: string;
  remaining_capacity?: number;
  booked_players?: number;
  total_capacity?: number;
  open_lobby_booking_id?: string | null;
  is_private_game?: boolean;
};

export function SlotPicker({
  slots,
  selected,
  stepMinutes,
  minBookingMinutes,
  onChange,
}: {
  slots: Slot[];
  selected: number[];
  stepMinutes: number;
  minBookingMinutes: number;
  onChange: (minutes: number[]) => void;
}) {
  const [pickStart, setPickStart] = useState<number | null>(null);
  const [pickEndHover, setPickEndHover] = useState<number | null>(null);

  const availableMinutes = useMemo(
    () => new Set(slots.filter((s) => s.available).map((s) => s.startMinute)),
    [slots],
  );

  const waitingForEnd = pickStart != null;
  const confirmed = selected.length > 0 && !waitingForEnd;

  const highlighted = useMemo(() => {
    if (waitingForEnd && pickStart != null) {
      const end = pickEndHover ?? pickStart;
      return new Set(visualTilesFromAnchors(pickStart, end, stepMinutes));
    }
    if (confirmed) {
      return new Set(visualHighlightForSlots(selected, stepMinutes));
    }
    return new Set<number>();
  }, [confirmed, pickEndHover, pickStart, selected, stepMinutes, waitingForEnd]);

  const previewBooking =
    waitingForEnd && pickStart != null
      ? bookingRangeFromAnchors(pickStart, pickEndHover ?? pickStart, stepMinutes)
      : confirmed
        ? bookingRangeFromAnchors(
            selected[0],
            selected[selected.length - 1] + stepMinutes,
            stepMinutes,
          )
        : null;

  const tryCommit = (start: number, end: number) => {
    const booking = bookingRangeFromAnchors(start, end, stepMinutes);
    if (booking.durationMinutes < minBookingMinutes) {
      toast.error(
        `Minimum booking is ${formatMinBookingDuration(minBookingMinutes) ?? `${minBookingMinutes} minutes`}`,
      );
      return false;
    }
    if (!isRangeAvailable(booking.slotStarts, availableMinutes)) {
      toast.error("Some slots in that range are unavailable");
      return false;
    }
    onChange(booking.slotStarts);
    setPickStart(null);
    setPickEndHover(null);
    return true;
  };

  const handleSlotClick = (minute: number) => {
    if (!waitingForEnd) {
      if (!availableMinutes.has(minute)) return;
      setPickStart(minute);
      setPickEndHover(minute);
      onChange([]);
      return;
    }

    tryCommit(pickStart, minute);
  };

  const rangeHours = previewBooking ? bookingDurationHours(previewBooking.durationMinutes) : 0;
  const showDuration =
    previewBooking != null &&
    (confirmed || (waitingForEnd && pickEndHover != null && pickEndHover !== pickStart));

  const previewInvalid =
    waitingForEnd &&
    previewBooking != null &&
    previewBooking.slotStarts.length > 0 &&
    !isRangeAvailable(previewBooking.slotStarts, availableMinutes);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="pointer-events-none absolute inset-0 bg-pitch opacity-25" />
      <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      <div className="relative mb-4 min-h-[3.25rem]">
        {waitingForEnd && (
          <p className="text-xs font-medium text-primary">
            Start: {formatSlotTime(pickStart!)} — tap your end time
          </p>
        )}
        {confirmed && previewBooking && (
          <p className="text-sm font-medium text-foreground">
            Selected: {formatSlotRange(previewBooking.startMinute, previewBooking.endMinute)}
            <span className="ml-2 text-muted-foreground">
              ({rangeHours} hour{rangeHours === 1 ? "" : "s"})
            </span>
          </p>
        )}
        {waitingForEnd && showDuration && previewBooking && (
          <p className="mt-1 text-sm font-medium text-foreground">
            Preview: {formatSlotRange(previewBooking.startMinute, previewBooking.endMinute)}
            <span className="ml-2 text-muted-foreground">
              ({rangeHours} hour{rangeHours === 1 ? "" : "s"})
            </span>
          </p>
        )}
      </div>

      <div className="relative grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {slots.map((slot) => {
          const isHighlighted = highlighted.has(slot.startMinute);
          const isStart =
            (waitingForEnd && pickStart === slot.startMinute) ||
            (confirmed && selected[0] === slot.startMinute);
          const endMinute =
            waitingForEnd && pickEndHover != null && pickEndHover !== pickStart
              ? pickEndHover
              : confirmed
                ? selected[selected.length - 1] + stepMinutes
                : null;
          const isEnd = endMinute === slot.startMinute;
          const isBookedSlot = confirmed && selected.includes(slot.startMinute);
          const isFull = slot.status === "booked" || (slot.remaining_capacity ?? 0) <= 0;
          const isVacant = !isFull && (slot.booked_players ?? 0) === 0;
          const isPartial = !isFull && (slot.booked_players ?? 0) > 0;
          const hasOpenLobby = Boolean(slot.open_lobby_booking_id);
          const showInvalid = isHighlighted && previewInvalid && isBookedSlot;

          return (
            <button
              key={slot.startMinute}
              type="button"
              disabled={!slot.available && !waitingForEnd}
              onClick={() => handleSlotClick(slot.startMinute)}
              onMouseEnter={() => {
                if (waitingForEnd) setPickEndHover(slot.startMinute);
              }}
              className={cn(
                "relative min-h-[4.25rem] rounded-xl border px-2 py-3 text-sm font-medium transition-colors duration-100",
                isFull && !isHighlighted && "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground line-through",
                isPartial && slot.available && !isHighlighted && "border-amber-500/40 bg-amber-500/10 text-foreground hover:border-amber-500",
                isVacant && slot.available && !isHighlighted && "border-emerald-500/40 bg-emerald-500/10 text-foreground hover:border-emerald-500",
                !isFull && !isPartial && !isVacant && slot.available && !isHighlighted && "border-primary/30 bg-background/60 text-foreground hover:border-primary hover:bg-primary/10",
                isHighlighted && !showInvalid && confirmed && "border-primary bg-primary text-primary-foreground glow-primary",
                isHighlighted && !showInvalid && waitingForEnd && "border-primary/70 bg-primary/80 text-primary-foreground",
                isHighlighted && showInvalid && "border-destructive bg-destructive/20 text-destructive",
                isEnd && !isBookedSlot && isHighlighted && waitingForEnd && "border-2 border-dashed border-primary bg-primary/20",
              )}
            >
              <div>{formatSlotTime(slot.startMinute)}</div>
              <div className="mt-1 h-4 text-[10px] leading-4 opacity-80">
                {isStart ? "Start" : isEnd ? "End" : isBookedSlot ? "Selected" : isFull ? "Full" : isVacant ? "Vacant" : `${slot.remaining_capacity ?? 0}/${slot.total_capacity ?? 0}`}
              </div>
              {hasOpenLobby && !isFull && !isHighlighted && (
                <div className="mt-0.5 text-[9px] font-semibold text-primary">Join match</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative mt-5 space-y-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Step 1:</span> tap start ·{" "}
          <span className="font-semibold text-foreground">Step 2:</span> tap end.
          Duration = end − start. Minimum{" "}
          {formatMinBookingDuration(minBookingMinutes) ?? `${minBookingMinutes} minutes`}.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-primary/40 bg-background" /> Available</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-primary" /> Selected</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border-2 border-dashed border-primary" /> End time</span>
        </div>
      </div>
    </div>
  );
}

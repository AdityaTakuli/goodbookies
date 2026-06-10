import { useCallback, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  bookingDurationHours,
  bookingRangeFromAnchors,
  formatMinBookingDuration,
  formatSlotRange,
  formatSlotTime,
  isRangeAvailable,
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
  const [startMinute, setStartMinute] = useState<number | null>(null);
  const [hoverMinute, setHoverMinute] = useState<number | null>(null);
  const [confirmedEnd, setConfirmedEnd] = useState<number | null>(null);

  const availableMinutes = new Set(
    slots.filter((s) => s.available).map((s) => s.startMinute),
  );

  const tryCommit = useCallback(
    (start: number, end: number) => {
      const booking = bookingRangeFromAnchors(start, end, stepMinutes);

      if (booking.durationMinutes < minBookingMinutes) {
        toast.error(
          `Minimum booking is ${formatMinBookingDuration(minBookingMinutes) ?? `${minBookingMinutes} minutes`}`,
        );
        return false;
      }
      if (booking.slotStarts.length === 0) {
        toast.error("Please pick a valid time range");
        return false;
      }
      if (!isRangeAvailable(booking.slotStarts, availableMinutes)) {
        toast.error("Some slots in that range are unavailable");
        return false;
      }
      onChange(booking.slotStarts);
      setConfirmedEnd(end);
      return true;
    },
    [availableMinutes, minBookingMinutes, onChange, stepMinutes],
  );

  const handleSlotClick = (minute: number) => {
    const pickingEnd = startMinute != null;

    if (!pickingEnd && !availableMinutes.has(minute)) return;

    if (!pickingEnd) {
      setStartMinute(minute);
      setHoverMinute(minute);
      setConfirmedEnd(null);
      onChange([]);
      return;
    }

    if (tryCommit(startMinute, minute)) {
      setStartMinute(null);
      setHoverMinute(null);
    }
  };

  const waitingForEnd = startMinute != null;
  const confirmedStart = selected.length > 0 ? selected[0] : null;

  const anchorA = waitingForEnd ? startMinute! : confirmedStart;
  const anchorB = waitingForEnd ? (hoverMinute ?? startMinute!) : confirmedEnd;

  const highlighted =
    anchorA != null && anchorB != null
      ? new Set(visualTilesFromAnchors(anchorA, anchorB, stepMinutes))
      : new Set<number>();

  const booking =
    anchorA != null && anchorB != null && anchorA !== anchorB
      ? bookingRangeFromAnchors(anchorA, anchorB, stepMinutes)
      : anchorA != null
        ? bookingRangeFromAnchors(anchorA, anchorA, stepMinutes)
        : null;

  const showSummary =
    !waitingForEnd && confirmedStart != null && confirmedEnd != null && booking;
  const showPreview = waitingForEnd && hoverMinute != null && hoverMinute !== startMinute && booking;

  const rangeLabel =
    showSummary || showPreview
      ? formatSlotRange(booking!.startMinute, booking!.endMinute)
      : waitingForEnd && startMinute != null
        ? `${formatSlotTime(startMinute)} — tap end time`
        : null;
  const rangeHours = booking ? bookingDurationHours(booking.durationMinutes) : 0;

  const previewInvalid =
    waitingForEnd &&
    booking != null &&
    booking.slotStarts.length > 0 &&
    !isRangeAvailable(booking.slotStarts, availableMinutes);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="pointer-events-none absolute inset-0 bg-pitch opacity-25" />
      <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      {waitingForEnd && (
        <p className="relative mb-2 text-xs font-medium text-primary">
          Start: {formatSlotTime(startMinute!)} — tap your end time
        </p>
      )}

      {rangeLabel && (showSummary || showPreview) && (
        <p className="relative mb-4 text-sm font-medium text-foreground">
          {waitingForEnd ? "Preview" : "Selected"}: {rangeLabel}
          <span className="ml-2 text-muted-foreground">
            ({rangeHours} hour{rangeHours === 1 ? "" : "s"})
          </span>
        </p>
      )}

      <div className="relative grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {slots.map((slot) => {
          const isHighlighted = highlighted.has(slot.startMinute);
          const isStartTap =
            (waitingForEnd && startMinute === slot.startMinute) ||
            (!waitingForEnd && confirmedStart === slot.startMinute);
          const isEndTap =
            (waitingForEnd && hoverMinute === slot.startMinute && hoverMinute !== startMinute) ||
            (!waitingForEnd && confirmedEnd === slot.startMinute);
          const isFull = slot.status === "booked" || (slot.remaining_capacity ?? 0) <= 0;
          const isVacant = !isFull && (slot.booked_players ?? 0) === 0;
          const isPartial = !isFull && (slot.booked_players ?? 0) > 0;
          const hasOpenLobby = Boolean(slot.open_lobby_booking_id);
          const showInvalid = isHighlighted && previewInvalid;

          return (
            <button
              key={slot.startMinute}
              type="button"
              disabled={!slot.available && !waitingForEnd}
              onClick={() => handleSlotClick(slot.startMinute)}
              onMouseEnter={() => {
                if (waitingForEnd) setHoverMinute(slot.startMinute);
              }}
              className={cn(
                "relative rounded-xl border px-2 py-3 text-sm font-medium transition-colors duration-150",
                isFull && !isHighlighted && "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground line-through",
                isPartial && slot.available && !isHighlighted && "border-amber-500/40 bg-amber-500/10 text-foreground hover:border-amber-500",
                isVacant && slot.available && !isHighlighted && "border-emerald-500/40 bg-emerald-500/10 text-foreground hover:border-emerald-500",
                !isFull && !isPartial && !isVacant && slot.available && !isHighlighted && "border-primary/30 bg-background/60 text-foreground hover:border-primary hover:bg-primary/10",
                isHighlighted && !showInvalid && "border-primary bg-primary text-primary-foreground glow-primary",
                isHighlighted && showInvalid && "border-destructive bg-destructive/20 text-destructive",
              )}
            >
              <div>{formatSlotTime(slot.startMinute)}</div>
              <div className="mt-1 text-[10px] opacity-80">
                {isFull && !isHighlighted
                  ? "Full"
                  : isVacant && !isHighlighted
                    ? "Vacant"
                    : isStartTap
                      ? "Start"
                      : isEndTap
                        ? "End"
                        : isHighlighted
                          ? "Selected"
                          : `${slot.remaining_capacity ?? 0}/${slot.total_capacity ?? 0} left`}
              </div>
              {hasOpenLobby && !isFull && !isHighlighted && (
                <div className="mt-0.5 text-[9px] font-semibold text-primary">Join match</div>
              )}
              {slot.is_private_game && isPartial && !isHighlighted && (
                <div className="mt-0.5 text-[9px] text-muted-foreground">Private</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative mt-5 space-y-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Step 1:</span> tap start ·{" "}
          <span className="font-semibold text-foreground">Step 2:</span> tap end.
          Both taps and all tiles between highlight. Duration = end − start. Minimum{" "}
          {formatMinBookingDuration(minBookingMinutes) ?? `${minBookingMinutes} minutes`}.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-primary/40 bg-background" /> Available</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-primary glow-primary" /> Selected range</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-muted/60" /> Booked</span>
        </div>
      </div>
    </div>
  );
}

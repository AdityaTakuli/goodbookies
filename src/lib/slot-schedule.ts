import {
  bookingEndMinute,
  bookingStartMinute,
  formatSlotRange,
  iterateBookingMinutes,
} from "@/lib/slot-time";

export type BookingWindowRow = {
  id?: string;
  start_hour: number;
  end_hour: number;
  start_minute?: number | null;
  end_minute?: number | null;
  player_count?: number | null;
  is_open_lobby?: boolean | null;
  status?: string | null;
};

export type VenueDaySession = {
  startMinute: number;
  endMinute: number;
  bookedPlayers: number;
  totalCapacity: number;
  remainingCapacity: number;
  individualEntryAllowed: boolean;
  isOpenLobby: boolean;
  bookingIds: string[];
  isFullTurf: boolean;
};

export type BookingSuggestion = {
  type: "join" | "reschedule";
  title: string;
  description: string;
  startMinute: number;
  endMinute: number;
  bookingId?: string;
  remainingCapacity?: number;
};

function minuteLoad(
  minute: number,
  bookings: BookingWindowRow[],
  stepMinutes: number,
) {
  let load = 0;
  for (const b of bookings) {
    const start = bookingStartMinute(b);
    const end = bookingEndMinute(b);
    if (minute >= start && minute < end) {
      load += Math.max(1, b.player_count ?? 1);
    }
  }
  return load;
}

/** Merge overlapping bookings into playable sessions for a day. */
export function buildVenueDaySessions(
  bookings: BookingWindowRow[],
  totalCapacity: number,
  stepMinutes: number,
): VenueDaySession[] {
  const active = bookings.filter((b) => b.status !== "cancelled");
  if (active.length === 0) return [];

  const boundaries = new Set<number>();
  for (const b of active) {
    boundaries.add(bookingStartMinute(b));
    boundaries.add(bookingEndMinute(b));
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const sessions: VenueDaySession[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const startMinute = points[i];
    const endMinute = points[i + 1];
    if (endMinute <= startMinute) continue;

    const overlapping = active.filter((b) => {
      const bStart = bookingStartMinute(b);
      const bEnd = bookingEndMinute(b);
      return bStart < endMinute && bEnd > startMinute;
    });
    if (overlapping.length === 0) continue;

    let peakBooked = 0;
    iterateBookingMinutes(startMinute, endMinute, stepMinutes, (m) => {
      peakBooked = Math.max(peakBooked, minuteLoad(m, active, stepMinutes));
    });

    const remainingCapacity = Math.max(0, totalCapacity - peakBooked);
    const isFullTurf = peakBooked >= totalCapacity;
    const isOpenLobby = overlapping.some((b) => b.is_open_lobby);

    const prev = sessions[sessions.length - 1];
    const sameLoad =
      prev &&
      prev.endMinute === startMinute &&
      prev.bookedPlayers === peakBooked &&
      prev.isOpenLobby === isOpenLobby &&
      prev.isFullTurf === isFullTurf;

    if (sameLoad) {
      prev.endMinute = endMinute;
      for (const b of overlapping) {
        if (b.id && !prev.bookingIds.includes(b.id)) prev.bookingIds.push(b.id);
      }
      prev.remainingCapacity = remainingCapacity;
      prev.individualEntryAllowed = remainingCapacity > 0 && !isFullTurf;
      continue;
    }

    sessions.push({
      startMinute,
      endMinute,
      bookedPlayers: peakBooked,
      totalCapacity,
      remainingCapacity,
      individualEntryAllowed: remainingCapacity > 0 && !isFullTurf,
      isOpenLobby,
      bookingIds: overlapping.map((b) => b.id).filter(Boolean) as string[],
      isFullTurf,
    });
  }

  return sessions;
}

export function suggestBookingAlternatives(
  startMinute: number,
  endMinute: number,
  playerCount: number,
  sessions: VenueDaySession[],
  stepMinutes: number,
): BookingSuggestion[] {
  const overlapping = sessions.filter(
    (s) => s.startMinute < endMinute && s.endMinute > startMinute && s.bookedPlayers > 0,
  );
  if (overlapping.length === 0) return [];

  const suggestions: BookingSuggestion[] = [];
  const joinTarget = overlapping.find(
    (s) => s.individualEntryAllowed && s.remainingCapacity >= playerCount,
  );

  if (joinTarget) {
    suggestions.push({
      type: "join",
      title: `Join the ${formatSlotRange(joinTarget.startMinute, joinTarget.endMinute)} game`,
      description: `${joinTarget.remainingCapacity} spot${joinTarget.remainingCapacity === 1 ? "" : "s"} left (${joinTarget.bookedPlayers}/${joinTarget.totalCapacity} players). Book an individual spot in the same window instead of overlapping.`,
      startMinute: joinTarget.startMinute,
      endMinute: joinTarget.endMinute,
      bookingId: joinTarget.bookingIds[0],
      remainingCapacity: joinTarget.remainingCapacity,
    });
  }

  const conflictEnd = Math.max(...overlapping.map((s) => s.endMinute));
  const duration = endMinute - startMinute;

  if (conflictEnd > startMinute && conflictEnd < endMinute) {
    suggestions.push({
      type: "reschedule",
      title: `Book from ${formatSlotRange(conflictEnd, conflictEnd + duration).split(" – ")[0]} instead`,
      description: `Your selection overlaps an existing booking. The nearest open start after it is ${formatSlotRange(conflictEnd, conflictEnd + duration)}.`,
      startMinute: conflictEnd,
      endMinute: conflictEnd + duration,
    });
  } else if (conflictEnd > startMinute && !joinTarget) {
    suggestions.push({
      type: "reschedule",
      title: `Try from ${formatSlotRange(conflictEnd, conflictEnd + duration)}`,
      description: "This window overlaps another booking. Pick a slot that starts when the existing game ends.",
      startMinute: conflictEnd,
      endMinute: conflictEnd + duration,
    });
  }

  return suggestions;
}

/** Slot starts for a session aligned to turf step grid. */
export function slotStartsForSession(
  startMinute: number,
  endMinute: number,
  stepMinutes: number,
) {
  const starts: number[] = [];
  for (let m = startMinute; m < endMinute; m += stepMinutes) starts.push(m);
  return starts;
}

export type BookingPlayerInfo = {
  player_names?: string[] | null;
  player_count?: number | null;
  profile?: { full_name?: string | null; email?: string | null } | null;
};

export function getBookingPlayerNames(booking: BookingPlayerInfo): string[] {
  const fromDb = (booking.player_names ?? []).map((n) => n.trim()).filter(Boolean);
  if (fromDb.length) return fromDb;
  const booker = booking.profile?.full_name || booking.profile?.email;
  return booker ? [booker] : [];
}

export function formatBookingPlayerNames(booking: BookingPlayerInfo): string {
  const names = getBookingPlayerNames(booking);
  return names.length ? names.join(", ") : "N/A";
}

export function bookingPlayerCount(booking: BookingPlayerInfo): number {
  const names = getBookingPlayerNames(booking);
  if (names.length) return names.length;
  return Math.max(1, booking.player_count ?? 1);
}

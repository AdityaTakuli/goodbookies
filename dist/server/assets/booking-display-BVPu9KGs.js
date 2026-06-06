function getBookingPlayerNames(booking) {
  const fromDb = (booking.player_names ?? []).map((n) => n.trim()).filter(Boolean);
  if (fromDb.length) return fromDb;
  const booker = booking.profile?.full_name || booking.profile?.email;
  return booker ? [booker] : [];
}
function formatBookingPlayerNames(booking) {
  const names = getBookingPlayerNames(booking);
  return names.length ? names.join(", ") : "—";
}
function bookingPlayerCount(booking) {
  const names = getBookingPlayerNames(booking);
  if (names.length) return names.length;
  return Math.max(1, booking.player_count ?? 1);
}
export {
  bookingPlayerCount as b,
  formatBookingPlayerNames as f
};

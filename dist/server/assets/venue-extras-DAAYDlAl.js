const VENUE_EXTRAS = {
  "yorker-yard-rectangular": {
    map_url: "https://maps.app.goo.gl/vVjrCR1oKQUhu4ks6",
    area_sq_ft: 7e3,
    water_available: "Yes (paid & unpaid)",
    min_booking_minutes: 60
  },
  "yorker-yard-oval-360": {
    map_url: "https://maps.app.goo.gl/RYbitkFExqU65NCa6",
    area_sq_ft: 15600,
    water_available: "Yes (paid & unpaid)",
    min_booking_minutes: 60
  }
};
function resolveMinBookingMinutes(venue) {
  const extra = VENUE_EXTRAS[venue.slug];
  return venue.min_booking_minutes ?? extra?.min_booking_minutes ?? venue.slot_duration_minutes ?? 60;
}
function withVenueExtras(venue) {
  const extra = VENUE_EXTRAS[venue.slug];
  if (!extra) return venue;
  return {
    ...venue,
    map_url: extra.map_url ?? venue.map_url,
    area_sq_ft: venue.area_sq_ft ?? extra.area_sq_ft,
    water_available: venue.water_available ?? extra.water_available,
    min_booking_minutes: venue.min_booking_minutes ?? extra.min_booking_minutes
  };
}
export {
  resolveMinBookingMinutes as r,
  withVenueExtras as w
};

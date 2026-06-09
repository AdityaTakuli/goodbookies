/** Per-venue fields until map_url / area_sq_ft / water_available exist in DB for all turfs. */
export const VENUE_EXTRAS: Record<
  string,
  { map_url?: string; area_sq_ft?: number; water_available?: string }
> = {
  "yorker-yard-rectangular": {
    map_url: "https://maps.app.goo.gl/vVjrCR1oKQUhu4ks6",
    area_sq_ft: 7000,
    water_available: "Yes (paid & unpaid)",
  },
  "yorker-yard-oval-360": {
    map_url: "https://maps.app.goo.gl/RYbitkFExqU65NCa6",
    area_sq_ft: 15600,
    water_available: "Yes (paid & unpaid)",
  },
};

export function withVenueExtras<T extends { slug: string }>(venue: T) {
  const extra = VENUE_EXTRAS[venue.slug];
  if (!extra) return venue;
  return {
    ...venue,
    map_url: extra.map_url ?? (venue as { map_url?: string | null }).map_url,
    area_sq_ft: (venue as { area_sq_ft?: number | null }).area_sq_ft ?? extra.area_sq_ft,
    water_available:
      (venue as { water_available?: string | null }).water_available ?? extra.water_available,
  };
}

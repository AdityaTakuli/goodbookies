/** Per-venue fields until map_url / area_sq_ft / water_available exist in DB for all turfs. */
import type { VenueMediaItem } from "@/lib/venue-media";

export const VENUE_EXTRAS: Record<
  string,
  {
    map_url?: string;
    area_sq_ft?: number;
    water_available?: string;
    min_booking_minutes?: number;
    media_gallery?: VenueMediaItem[];
  }
> = {
  "yorker-yard-rectangular": {
    map_url: "https://maps.app.goo.gl/vVjrCR1oKQUhu4ks6",
    area_sq_ft: 7000,
    water_available: "Yes (paid & unpaid)",
    min_booking_minutes: 60,
  },
  "yorker-yard-360": {
    map_url: "https://maps.app.goo.gl/RYbitkFExqU65NCa6",
    area_sq_ft: 15600,
    water_available: "Yes (paid & unpaid)",
    min_booking_minutes: 30,
    media_gallery: [
      { type: "image", url: "/venues/yorker-yard-360/top-view.png", label: "Top view" },
      { type: "image", url: "/venues/yorker-yard-360/side-view.png", label: "Side view" },
      { type: "image", url: "/venues/yorker-yard-360/side-view-2.png", label: "Side view 2" },
      { type: "video", url: "/venues/yorker-yard-360/turf-tour.mp4", label: "Turf tour" },
    ],
  },
  "yorker-yard-oval-360": {
    map_url: "https://maps.app.goo.gl/RYbitkFExqU65NCa6",
    area_sq_ft: 15600,
    water_available: "Yes (paid & unpaid)",
    min_booking_minutes: 30,
  },
};

export function resolveMinBookingMinutes(venue: {
  slug: string;
  min_booking_minutes?: number | null;
  slot_duration_minutes?: number | null;
}) {
  const extra = VENUE_EXTRAS[venue.slug];
  return (
    venue.min_booking_minutes ??
    extra?.min_booking_minutes ??
    venue.slot_duration_minutes ??
    60
  );
}

export function withVenueExtras<T extends { slug: string }>(venue: T) {
  const extra = VENUE_EXTRAS[venue.slug];
  if (!extra) return venue;
  const dbGallery = (venue as { media_gallery?: unknown }).media_gallery;
  const hasDbGallery = Array.isArray(dbGallery) && dbGallery.length > 0;
  return {
    ...venue,
    map_url: extra.map_url ?? (venue as { map_url?: string | null }).map_url,
    area_sq_ft: (venue as { area_sq_ft?: number | null }).area_sq_ft ?? extra.area_sq_ft,
    water_available:
      (venue as { water_available?: string | null }).water_available ?? extra.water_available,
    min_booking_minutes:
      (venue as { min_booking_minutes?: number | null }).min_booking_minutes ??
      extra.min_booking_minutes,
    media_gallery: hasDbGallery ? dbGallery : extra.media_gallery,
  };
}

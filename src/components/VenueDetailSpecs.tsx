import { ExternalLink } from "lucide-react";
import { formatMinBookingDuration } from "@/lib/slot-time";
import { resolveMinBookingMinutes } from "@/lib/venue-extras";

type VenueSpecs = {
  slug?: string;
  venue_type?: string | null;
  area_sq_ft?: number | null;
  max_players_allowed?: number | null;
  slot_duration_minutes?: number | null;
  min_booking_minutes?: number | null;
  opening_hour?: number | null;
  closing_hour?: number | null;
  amenities?: string[] | null;
  water_available?: string | null;
  address?: string | null;
  map_url?: string | null;
};

function formatShape(venueType?: string | null) {
  if (!venueType) return null;
  const map: Record<string, string> = {
    rectangle: "Rectangular",
    circular: "Circular",
    outdoor: "Outdoor",
  };
  return map[venueType.toLowerCase()] ?? venueType.charAt(0).toUpperCase() + venueType.slice(1);
}

function formatMinBooking(minutes?: number | null) {
  return formatMinBookingDuration(minutes);
}

export function isOpen24Hours(opening?: number | null, closing?: number | null) {
  return opening === 0 && (closing ?? 0) >= 24;
}

function hasCricketEquipment(amenities?: string[] | null) {
  return amenities?.some((a) => /cricket equipment/i.test(a)) ?? false;
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function VenueDetailSpecs({ venue }: { venue: VenueSpecs }) {
  const shape = formatShape(venue.venue_type);
  const size =
    venue.area_sq_ft != null ? `${venue.area_sq_ft.toLocaleString("en-IN")} sq ft` : null;
  const capacity =
    venue.max_players_allowed != null
      ? `${venue.max_players_allowed} player${venue.max_players_allowed === 1 ? "" : "s"}`
      : null;
  const minBooking = formatMinBooking(
    venue.slug ? resolveMinBookingMinutes(venue as { slug: string; min_booking_minutes?: number | null; slot_duration_minutes?: number | null }) : venue.min_booking_minutes ?? venue.slot_duration_minutes,
  );
  const open24 = isOpen24Hours(venue.opening_hour, venue.closing_hour);
  const cricketGear = hasCricketEquipment(venue.amenities) ? "Yes" : null;
  const water = venue.water_available?.trim() || null;

  const hasStructured =
    shape || size || capacity || minBooking || open24 || cricketGear || water || venue.map_url;
  if (!hasStructured) return null;

  return (
    <div className="mt-4 space-y-3">
      {open24 && (
        <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          Open 24 hours
        </span>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {shape && <Spec label="Shape" value={shape} />}
        {size && <Spec label="Size" value={size} />}
        {capacity && <Spec label="Ideal capacity" value={capacity} />}
        {minBooking && <Spec label="Min booking time" value={minBooking} />}
        {cricketGear && <Spec label="Cricket equipment available" value={cricketGear} />}
        {water && <Spec label="Water available" value={water} />}
        {venue.address && (
          <div className="rounded-xl border border-border/60 bg-card/50 px-3 py-2.5 sm:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Location</p>
            {venue.map_url ? (
              <a
                href={venue.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {venue.address}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
            ) : (
              <p className="mt-0.5 text-sm font-semibold text-foreground">{venue.address}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

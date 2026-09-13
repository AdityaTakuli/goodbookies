import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { resolveVenueImage } from "@/lib/images";

type Venue = {
  slug: string;
  name: string;
  city: string;
  image_url: string | null;
  price_per_hour: number;
  rating: number | null;
  review_count?: number | null;
  sport: { name: string; icon: string | null } | null;
};

const FALLBACK_IMAGE = resolveVenueImage(null);

export function VenueCard({ venue, index = 0 }: { venue: Venue; index?: number }) {
  const reviews = venue.review_count ?? 0;

  return (
    // CSS animation (not framer-motion) so server-rendered cards are visible even before hydration.
    <div
      className="animate-rise"
      style={{ "--rise-delay": `${Math.min(index, 8) * 60}ms` } as React.CSSProperties}
    >
      <Link
        to="/venues/$slug"
        params={{ slug: venue.slug }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-glow)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={resolveVenueImage(venue.image_url)}
            alt={venue.name}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            width={1280}
            height={960}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold backdrop-blur">
            {venue.sport?.icon} {venue.sport?.name}
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
            <Star className="h-3 w-3 fill-current" />
            {venue.rating != null ? Number(venue.rating).toFixed(1) : "New"}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold leading-snug">{venue.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{venue.city}</span>
            {reviews > 0 && (
              <span className="shrink-0">
                · {reviews} review{reviews === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div className="mt-auto flex items-end justify-between pt-5">
            <div>
              <span className="text-2xl font-bold text-foreground">
                ₹{venue.price_per_hour.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted-foreground"> / hr</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              Book{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
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

export function VenueCard({ venue, index = 0 }: { venue: Venue; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to="/venues/$slug"
        params={{ slug: venue.slug }}
        className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-glow)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={resolveVenueImage(venue.image_url)}
            alt={venue.name}
            loading="lazy"
            width={1280}
            height={800}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur">
            {venue.sport?.icon} {venue.sport?.name}
          </div>
          <div className="absolute right-3 top-3 flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground">
              <Star className="h-3 w-3 fill-current" />
              {venue.rating != null ? Number(venue.rating).toFixed(1) : "New"}
            </div>
            {(venue.review_count ?? 0) > 0 && (
              <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
                {venue.review_count} review{(venue.review_count ?? 0) === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold">{venue.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {venue.city}
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">₹{venue.price_per_hour}</span>
              <span className="text-sm text-muted-foreground"> / hr</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary group-hover:underline">
              Book →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
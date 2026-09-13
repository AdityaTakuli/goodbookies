import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { listSports, listVenues } from "@/lib/booking.functions";
import { VenueCard } from "@/components/VenueCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildPageMeta, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const searchSchema = z.object({ sport: z.string().optional() });

const sportsQO = queryOptions({ queryKey: ["sports"], queryFn: () => listSports() });
const venuesQO = (sport?: string) =>
  queryOptions({
    queryKey: ["venues", sport ?? "all"],
    queryFn: () => listVenues({ data: { sport } }),
  });

export const Route = createFileRoute("/sports")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ sport: search.sport }),
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(sportsQO);
    context.queryClient.ensureQueryData(venuesQO(deps.sport));
  },
  head: ({ loaderDeps }) => {
    const sport = loaderDeps?.sport;
    const title = sport
      ? `${sport.charAt(0).toUpperCase()}${sport.slice(1)} Turfs & Venues`
      : "Sports Turfs & Venues";
    const description = sport
      ? `Browse and book ${sport} turfs and venues near you. Compare prices, ratings, and live slot availability on Good Bookies.`
      : "Browse and book football turfs, cricket nets, basketball courts, badminton courts and more. Filter by sport, city and price.";
    const path = sport ? `/sports?sport=${encodeURIComponent(sport)}` : "/sports";
    const { meta, links } = buildPageMeta({ title, description, path });
    return { meta, links };
  },
  component: SportsPage,
});

const pillClass = (active: boolean) =>
  cn(
    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground",
  );

function SportsPage() {
  const { sport } = Route.useSearch();
  const { data: sports } = useSuspenseQuery(sportsQO);
  const { data: venues } = useSuspenseQuery(venuesQO(sport));
  const activeSport = sports.find((s) => s.slug === sport);

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Venues", path: "/sports" },
        ])}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Book a venue</p>
      <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
        {activeSport ? `${activeSport.name} venues` : "All venues"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {venues.length} venue{venues.length === 1 ? "" : "s"} available{" "}
        {activeSport ? `for ${activeSport.name.toLowerCase()}` : "across all sports"} · live slot
        availability
      </p>

      {/* Scrolls horizontally on phones instead of wrapping into several rows. */}
      <nav
        aria-label="Filter by sport"
        className="scrollbar-none -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <Link
          to="/sports"
          search={{}}
          className={pillClass(!sport)}
          aria-current={!sport ? "page" : undefined}
        >
          All
        </Link>
        {sports.map((s) => (
          <Link
            key={s.id}
            to="/sports"
            search={{ sport: s.slug }}
            className={pillClass(sport === s.slug)}
            aria-current={sport === s.slug ? "page" : undefined}
          >
            <span aria-hidden>{s.icon}</span> {s.name}
          </Link>
        ))}
      </nav>

      {venues.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v, i) => (
            <VenueCard key={v.id} venue={v as any} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold">No venues here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We're adding new {activeSport ? activeSport.name.toLowerCase() : ""} venues soon. Try
            another sport meanwhile.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/sports" search={{}}>
              Browse all venues
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

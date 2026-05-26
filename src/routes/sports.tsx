import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { listSports, listVenues } from "@/lib/booking.functions";
import { VenueCard } from "@/components/VenueCard";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ sport: z.string().optional() });

const sportsQO = queryOptions({ queryKey: ["sports"], queryFn: () => listSports() });
const venuesQO = (sport?: string) =>
  queryOptions({ queryKey: ["venues", sport ?? "all"], queryFn: () => listVenues({ data: { sport } }) });

export const Route = createFileRoute("/sports")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ sport: search.sport }),
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(sportsQO);
    context.queryClient.ensureQueryData(venuesQO(deps.sport));
  },
  head: () => ({
    meta: [
      { title: "Sports & Venues — Good Bookies" },
      { name: "description", content: "Browse all sports venues. Filter by football, cricket, basketball and more." },
    ],
  }),
  component: SportsPage,
});

function SportsPage() {
  const { sport } = Route.useSearch();
  const { data: sports } = useSuspenseQuery(sportsQO);
  const { data: venues } = useSuspenseQuery(venuesQO(sport));

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">All venues</h1>
      <p className="mt-2 text-muted-foreground">
        {venues.length} venue{venues.length === 1 ? "" : "s"} available {sport ? `for ${sport}` : "across all sports"}.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/sports"
          search={{}}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            !sport ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60",
          )}
        >
          All
        </Link>
        {sports.map((s) => (
          <Link
            key={s.id}
            to="/sports"
            search={{ sport: s.slug }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              sport === s.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60",
            )}
          >
            {s.icon} {s.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((v, i) => (
          <VenueCard key={v.id} venue={v as any} index={i} />
        ))}
      </div>

      {venues.length === 0 && (
        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
          No venues yet for this sport. Check back soon!
        </div>
      )}
    </div>
  );
}
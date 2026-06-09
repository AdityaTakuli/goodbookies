import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listSports } from "@/lib/booking.functions";
import heroMobileWebp from "@/assets/hero-turf-mobile.webp";
import heroWebp from "@/assets/hero-turf.webp";
import { Calendar, MapPin, Zap } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMeta, organizationJsonLd, websiteJsonLd, SITE_NAME } from "@/lib/seo";

const sportsQO = queryOptions({ queryKey: ["sports"], queryFn: () => listSports() });
const HERO_SRCSET = `${heroMobileWebp} 800w, ${heroWebp} 1600w`;

const SPORT_COVER_IMAGES: Record<string, string> = {
  cricket: "/venues/yorker-yard-cricket.webp",
  badminton: "/venues/badminton-cover.webp",
  basketball: "/venues/basketball-cover.webp",
};

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const sports = await context.queryClient.ensureQueryData(sportsQO);
    return { sports };
  },
  head: () => {
    const { meta, links } = buildPageMeta({
      title: SITE_NAME,
      description:
        "Book floodlit football turfs, cricket nets and indoor courts online. Live slot availability, instant confirmation, and open match lobbies across India.",
      path: "/",
      image: heroWebp,
    });
    return {
      meta,
      links: [
        ...links,
        {
          rel: "preload",
          href: heroMobileWebp,
          as: "image",
          type: "image/webp",
          fetchPriority: "high",
          imageSrcSet: HERO_SRCSET,
          imageSizes: "100vw",
        },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { sports } = Route.useLoaderData();

  return (
    <div>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <section className="relative isolate min-h-[min(62vh,560px)] overflow-hidden bg-background md:min-h-[min(70vh,720px)]">
        <img
          src={heroMobileWebp}
          srcSet={HERO_SRCSET}
          sizes="100vw"
          alt="Floodlit sports turf at night, book on Good Bookies"
          width={1600}
          height={900}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="container mx-auto px-4 py-16 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="h-3 w-3" /> Real-time slot availability
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              Book the <span className="text-gradient-turf">pitch</span>. Play the match.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              Floodlit turfs, cricket nets and indoor courts. Find your slot, lock it in, and show up ready to play.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/sports">
                <Button size="lg" className="glow-primary">Book a fresh turf</Button>
              </Link>
              <Link to="/lobbies">
                <Button size="lg" variant="outline">Join an open match</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20">
        <div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">Pick your sport</h2>
          <p className="mt-2 text-muted-foreground">Tap a sport to see venues near you.</p>
        </div>
        <div className="mt-10 grid min-h-[280px] grid-cols-2 gap-4 sm:grid-cols-3 md:min-h-0 md:grid-cols-5">
          {sports.map((s) => {
            const cover = SPORT_COVER_IMAGES[s.slug] ?? null;
            return (
            <Link
              key={s.id}
              to="/sports"
              search={{ sport: s.slug }}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/60 transition-colors hover:border-primary",
                cover ? "bg-card" : "bg-card",
              )}
            >
              {cover ? (
                <>
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
                </>
              ) : null}
              <span className="relative text-4xl">{s.icon}</span>
              <span className="relative mt-3 text-sm font-semibold">{s.name}</span>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 content-visibility-auto md:py-20">
        <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: MapPin, title: "Choose a venue", desc: "Filter by sport, city or price. See ratings and amenities." },
            { icon: Calendar, title: "Pick your slot", desc: "Live availability. Tap the hours you want to play." },
            { icon: Zap, title: "Confirm & play", desc: "Instant confirmation. Show up and play. That's it." },
          ].map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{i + 1}. {step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

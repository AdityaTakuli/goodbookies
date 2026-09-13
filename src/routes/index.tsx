import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listSports } from "@/lib/booking.functions";
import heroMobileWebp from "@/assets/hero-turf-mobile.webp";
import heroWebp from "@/assets/hero-turf.webp";
import { ArrowRight, BadgeCheck, Calendar, MapPin, ShieldCheck, Users, Zap } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMeta, organizationJsonLd, websiteJsonLd, SITE_NAME } from "@/lib/seo";
import { cn } from "@/lib/utils";

const sportsQO = queryOptions({ queryKey: ["sports"], queryFn: () => listSports() });
const HERO_SRCSET = `${heroMobileWebp} 800w, ${heroWebp} 1600w`;

const SPORT_COVER_IMAGES: Record<string, string> = {
  cricket: "/venues/yorker-yard-cricket.webp",
  badminton: "/venues/badminton-cover.webp",
  basketball: "/venues/basketball-cover.webp",
  football: "/venues/football-cover.webp",
};

// Static class strings so Tailwind can see them; keeps the grid full whatever the sport count.
const SPORT_GRID_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

const HIGHLIGHTS = [
  { icon: Zap, label: "Instant confirmation" },
  { icon: ShieldCheck, label: "Secure Razorpay payments" },
  { icon: Users, label: "Join open matches" },
];

const STEPS = [
  {
    icon: MapPin,
    title: "Choose a venue",
    desc: "Filter by sport, city or price. See ratings and amenities.",
  },
  {
    icon: Calendar,
    title: "Pick your slot",
    desc: "Live availability. Tap the hours you want to play.",
  },
  {
    icon: BadgeCheck,
    title: "Confirm & play",
    desc: "Instant confirmation. Show up and play. That's it.",
  },
];

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
      <section className="relative isolate flex min-h-[min(78svh,640px)] items-center overflow-hidden bg-background md:min-h-[min(82vh,760px)]">
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Real-time slot availability
            </span>
            <h1
              className="animate-rise mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl"
              style={{ "--rise-delay": "60ms" } as React.CSSProperties}
            >
              Book the <span className="text-gradient-turf">pitch</span>. Play the match.
            </h1>
            <p
              className="animate-rise mt-6 max-w-xl text-base text-muted-foreground md:text-lg"
              style={{ "--rise-delay": "120ms" } as React.CSSProperties}
            >
              Floodlit turfs, cricket nets and indoor courts. Find your slot, lock it in, and show
              up ready to play.
            </p>
            <div
              className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ "--rise-delay": "180ms" } as React.CSSProperties}
            >
              <Button asChild size="lg" className="glow-primary h-12 px-7 text-base">
                <Link to="/sports">
                  Book a turf <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 bg-background/40 px-7 text-base backdrop-blur"
              >
                <Link to="/lobbies">Join an open match</Link>
              </Button>
            </div>
            <ul
              className="animate-rise mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
              style={{ "--rise-delay": "240ms" } as React.CSSProperties}
            >
              {HIGHLIGHTS.map((h) => (
                <li key={h.label} className="flex items-center gap-2">
                  <h.icon className="h-4 w-4 text-primary" />
                  {h.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sports</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Pick your sport</h2>
            <p className="mt-2 text-muted-foreground">Tap a sport to see venues near you.</p>
          </div>
          <Link
            to="/sports"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all venues{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div
          className={cn(
            "mt-10 grid grid-cols-2 gap-3 sm:gap-4",
            SPORT_GRID_COLS[Math.min(sports.length, 4)] ?? "sm:grid-cols-4",
            sports.length >= 5 && "lg:grid-cols-5",
          )}
        >
          {sports.map((s) => {
            const cover = SPORT_COVER_IMAGES[s.slug] ?? null;
            return (
              <Link
                key={s.id}
                to="/sports"
                search={{ sport: s.slug }}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-[border-color,box-shadow] duration-300 hover:border-primary hover:shadow-[var(--shadow-glow)] sm:aspect-square md:p-5"
              >
                {cover ? (
                  <>
                    <img
                      src={cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={600}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  </>
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-5xl" aria-hidden>
                    {s.icon}
                  </span>
                )}
                <span className="relative flex items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold md:text-lg">{s.name}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary backdrop-blur transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="content-visibility-auto border-y border-border/60 bg-card/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            From search to kick-off in 3 steps
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/50"
              >
                <span
                  className="absolute right-6 top-5 font-display text-5xl font-bold text-foreground/5"
                  aria-hidden
                >
                  0{i + 1}
                </span>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="content-visibility-auto container mx-auto px-4 pt-16 md:pt-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-8 md:p-12">
          <div className="bg-pitch pointer-events-none absolute inset-0 opacity-20" aria-hidden />
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Own a turf or court?</h2>
              <p className="mt-2 text-muted-foreground">
                List your venue on Good Bookies. Fill empty slots, take payments online and manage
                bookings from one dashboard.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7">
                <Link to="/owner/register">List your venue</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <Link to="/owner/login">Partner login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Q as jsxRuntimeExports } from "./server-BDxa_Kju.js";
import { d as Link, g as Route, n as breadcrumbJsonLd, B as Button, a8 as sportsQO, aj as venuesQO, r as cn } from "./router-Dbk61_Mg.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-TR-mLCsH.js";
import { b as resolveVenueImage } from "./urls-ChthLJ-h.js";
import { S as Star } from "./star-D0QLT5N9.js";
import { M as MapPin } from "./map-pin-3AP1afNS.js";
import { A as ArrowRight } from "./arrow-right-cLCqdGka.js";
import { J as JsonLd } from "./JsonLd-DI6olVRS.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-CXeE-dWU.js";
import "./cancellation-policy-CDWg5dXD.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-D_dntZRf.js";
const FALLBACK_IMAGE = resolveVenueImage(null);
function VenueCard({ venue, index = 0 }) {
  const reviews = venue.review_count ?? 0;
  return (
    // CSS animation (not framer-motion) so server-rendered cards are visible even before hydration.
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "animate-rise",
        style: { "--rise-delay": `${Math.min(index, 8) * 60}ms` },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/venues/$slug",
            params: { slug: venue.slug },
            className: "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-glow)]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] overflow-hidden bg-muted", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: resolveVenueImage(venue.image_url),
                    alt: venue.name,
                    loading: index < 3 ? "eager" : "lazy",
                    decoding: "async",
                    width: 1280,
                    height: 960,
                    sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
                    onError: (e) => {
                      if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
                    },
                    className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold backdrop-blur", children: [
                  venue.sport?.icon,
                  " ",
                  venue.sport?.name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }),
                  venue.rating != null ? Number(venue.rating).toFixed(1) : "New"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold leading-snug", children: venue.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1.5 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: venue.city }),
                  reviews > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0", children: [
                    "· ",
                    reviews,
                    " review",
                    reviews === 1 ? "" : "s"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-end justify-between pt-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-foreground", children: [
                      "₹",
                      venue.price_per_hour.toLocaleString("en-IN")
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: " / hr" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground", children: [
                    "Book",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" })
                  ] })
                ] })
              ] })
            ]
          }
        )
      }
    )
  );
}
const pillClass = (active) => cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground");
function SportsPage() {
  const {
    sport
  } = Route.useSearch();
  const {
    data: sports
  } = useSuspenseQuery(sportsQO);
  const {
    data: venues
  } = useSuspenseQuery(venuesQO(sport));
  const activeSport = sports.find((s) => s.slug === sport);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10 md:py-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: breadcrumbJsonLd([{
      name: "Home",
      path: "/"
    }, {
      name: "Venues",
      path: "/sports"
    }]) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-primary", children: "Book a venue" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl font-bold md:text-5xl", children: activeSport ? `${activeSport.name} venues` : "All venues" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
      venues.length,
      " venue",
      venues.length === 1 ? "" : "s",
      " available",
      " ",
      activeSport ? `for ${activeSport.name.toLowerCase()}` : "across all sports",
      " · live slot availability"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Filter by sport", className: "scrollbar-none -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", search: {}, className: pillClass(!sport), "aria-current": !sport ? "page" : void 0, children: "All" }),
      sports.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sports", search: {
        sport: s.slug
      }, className: pillClass(sport === s.slug), "aria-current": sport === s.slug ? "page" : void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: s.icon }),
        " ",
        s.name
      ] }, s.id))
    ] }),
    venues.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: venues.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(VenueCard, { venue: v, index: i }, v.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-semibold", children: "No venues here yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "We're adding new ",
        activeSport ? activeSport.name.toLowerCase() : "",
        " venues soon. Try another sport meanwhile."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", search: {}, children: "Browse all venues" }) })
    ] })
  ] });
}
export {
  SportsPage as component
};

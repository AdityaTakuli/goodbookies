import { Q as jsxRuntimeExports } from "./server-kUsPFTeq.js";
import { d as Link, g as Route, n as breadcrumbJsonLd, p as cn, a4 as sportsQO, ae as venuesQO } from "./router-BoA3wDIv.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BQXex1aV.js";
import { b as resolveVenueImage } from "./urls-CW7Hd3Bj.js";
import { m as motion } from "./proxy-CLvXwB-P.js";
import { S as Star } from "./star-STqY7gSK.js";
import { M as MapPin } from "./map-pin-Cco3cREL.js";
import { J as JsonLd } from "./JsonLd-D14sRPGk.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./auth-middleware-DPQHMA7I.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-CWX68g6j.js";
function VenueCard({ venue, index = 0 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay: index * 0.06 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/venues/$slug",
          params: { slug: venue.slug },
          className: "group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-glow)]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: resolveVenueImage(venue.image_url),
                  alt: venue.name,
                  loading: "lazy",
                  width: 1280,
                  height: 800,
                  className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur", children: [
                venue.sport?.icon,
                " ",
                venue.sport?.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-3 top-3 flex flex-col items-end gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }),
                  venue.rating != null ? Number(venue.rating).toFixed(1) : "New"
                ] }),
                (venue.review_count ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur", children: [
                  venue.review_count,
                  " review",
                  (venue.review_count ?? 0) === 1 ? "" : "s"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: venue.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
                " ",
                venue.city
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-baseline justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-primary", children: [
                    "₹",
                    venue.price_per_hour
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: " / hr" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-primary group-hover:underline", children: "Book →" })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: breadcrumbJsonLd([{
      name: "Home",
      path: "/"
    }, {
      name: "Venues",
      path: "/sports"
    }]) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold md:text-5xl", children: "All venues" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
      venues.length,
      " venue",
      venues.length === 1 ? "" : "s",
      " available ",
      sport ? `for ${sport}` : "across all sports",
      "."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", search: {}, className: cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", !sport ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60"), children: "All" }),
      sports.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sports", search: {
        sport: s.slug
      }, className: cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", sport === s.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60"), children: [
        s.icon,
        " ",
        s.name
      ] }, s.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: venues.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(VenueCard, { venue: v, index: i }, v.id)) }),
    venues.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground", children: "No venues yet for this sport. Check back soon!" })
  ] });
}
export {
  SportsPage as component
};

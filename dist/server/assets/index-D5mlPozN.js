import { Q as jsxRuntimeExports } from "./server-CorN6qw5.js";
import { m as createLucideIcon, c as Route, E as organizationJsonLd, a6 as websiteJsonLd, H as HERO_SRCSET, u as heroMobileWebp, L as Link, B as Button } from "./router-EbU1nqEp.js";
import { J as JsonLd } from "./JsonLd-CZ2qvvo7.js";
import { M as MapPin } from "./map-pin-Bmxd1yGS.js";
import { C as Calendar } from "./calendar-8bAvryKi.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-D-Qa20da.js";
import "./auth-middleware-DcElV_TJ.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
const __iconNode = [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
const SPORT_COVER_IMAGES = {
  cricket: "/venues/yorker-yard-cricket.webp",
  badminton: "/venues/badminton-cover.webp",
  basketball: "/venues/basketball-cover.webp"
};
function Index() {
  const {
    sports
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: [organizationJsonLd(), websiteJsonLd()] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative isolate min-h-[min(62vh,560px)] overflow-hidden bg-background md:min-h-[min(70vh,720px)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroMobileWebp, srcSet: HERO_SRCSET, sizes: "100vw", alt: "Floodlit sports turf at night, book on Good Bookies", width: 1600, height: 900, fetchPriority: "high", loading: "eager", decoding: "sync", className: "absolute inset-0 -z-10 h-full w-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-16 md:py-36", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }),
          " Real-time slot availability"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl", children: [
          "Book the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-turf", children: "pitch" }),
          ". Play the match."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-xl text-base text-muted-foreground md:text-lg", children: "Floodlit turfs, cricket nets and indoor courts. Find your slot, lock it in, and show up ready to play." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "glow-primary", children: "Book a fresh turf" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/lobbies", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", children: "Join an open match" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "container mx-auto px-4 py-16 md:py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold md:text-4xl", children: "Pick your sport" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Tap a sport to see venues near you." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid min-h-[280px] grid-cols-2 gap-4 sm:grid-cols-3 md:min-h-0 md:grid-cols-5", children: sports.map((s) => {
        const cover = SPORT_COVER_IMAGES[s.slug] ?? null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sports", search: {
          sport: s.slug
        }, className: cn("group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/60 transition-colors hover:border-primary", cover ? "bg-card" : "bg-card"), children: [
          cover ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cover, alt: "", loading: "lazy", className: "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative text-4xl", children: s.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative mt-3 text-sm font-semibold", children: s.name })
        ] }, s.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "container mx-auto px-4 py-16 content-visibility-auto md:py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold md:text-4xl", children: "How it works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-6 md:grid-cols-3", children: [{
        icon: MapPin,
        title: "Choose a venue",
        desc: "Filter by sport, city or price. See ratings and amenities."
      }, {
        icon: Calendar,
        title: "Pick your slot",
        desc: "Live availability. Tap the hours you want to play."
      }, {
        icon: Zap,
        title: "Confirm & play",
        desc: "Instant confirmation. Show up and play. That's it."
      }].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(step.icon, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mt-4 font-display text-xl font-semibold", children: [
          i + 1,
          ". ",
          step.title
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: step.desc })
      ] }, step.title)) })
    ] })
  ] });
}
export {
  Index as component
};

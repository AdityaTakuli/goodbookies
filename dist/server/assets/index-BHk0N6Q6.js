import { Q as jsxRuntimeExports } from "./server-BDxa_Kju.js";
import { u as createLucideIcon, i as Route, V as organizationJsonLd, ak as websiteJsonLd, H as HERO_SRCSET, G as heroMobileWebp, B as Button, d as Link, r as cn } from "./router-Dbk61_Mg.js";
import { J as JsonLd } from "./JsonLd-DI6olVRS.js";
import { A as ArrowRight } from "./arrow-right-cLCqdGka.js";
import { S as ShieldCheck } from "./shield-check-DOX3aoYc.js";
import { U as Users } from "./users-RhXqydkB.js";
import { M as MapPin } from "./map-pin-3AP1afNS.js";
import { C as Calendar } from "./calendar-DntYvLjE.js";
import { B as BadgeCheck } from "./badge-check-DycFCcRS.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-ChthLJ-h.js";
import "./auth-middleware-CXeE-dWU.js";
import "./cancellation-policy-CDWg5dXD.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
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
  basketball: "/venues/basketball-cover.webp",
  football: "/venues/football-cover.webp"
};
const SPORT_GRID_COLS = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4"
};
const HIGHLIGHTS = [{
  icon: Zap,
  label: "Instant confirmation"
}, {
  icon: ShieldCheck,
  label: "Secure Razorpay payments"
}, {
  icon: Users,
  label: "Join open matches"
}];
const STEPS = [{
  icon: MapPin,
  title: "Choose a venue",
  desc: "Filter by sport, city or price. See ratings and amenities."
}, {
  icon: Calendar,
  title: "Pick your slot",
  desc: "Live availability. Tap the hours you want to play."
}, {
  icon: BadgeCheck,
  title: "Confirm & play",
  desc: "Instant confirmation. Show up and play. That's it."
}];
function Index() {
  const {
    sports
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: [organizationJsonLd(), websiteJsonLd()] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative isolate flex min-h-[min(78svh,640px)] items-center overflow-hidden bg-background md:min-h-[min(82vh,760px)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroMobileWebp, srcSet: HERO_SRCSET, sizes: "100vw", alt: "Floodlit sports turf at night, book on Good Bookies", width: 1600, height: 900, fetchPriority: "high", loading: "eager", decoding: "sync", className: "absolute inset-0 -z-10 h-full w-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 bg-gradient-to-r from-background/80 via-background/30 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-16 md:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "animate-rise inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-primary" })
          ] }),
          "Real-time slot availability"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "animate-rise mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl", style: {
          "--rise-delay": "60ms"
        }, children: [
          "Book the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-turf", children: "pitch" }),
          ". Play the match."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "animate-rise mt-6 max-w-xl text-base text-muted-foreground md:text-lg", style: {
          "--rise-delay": "120ms"
        }, children: "Floodlit turfs, cricket nets and indoor courts. Find your slot, lock it in, and show up ready to play." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-rise mt-8 flex flex-col gap-3 sm:flex-row", style: {
          "--rise-delay": "180ms"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "glow-primary h-12 px-7 text-base", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sports", children: [
            "Book a turf ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "h-12 bg-background/40 px-7 text-base backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/lobbies", children: "Join an open match" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "animate-rise mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground", style: {
          "--rise-delay": "240ms"
        }, children: HIGHLIGHTS.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(h.icon, { className: "h-4 w-4 text-primary" }),
          h.label
        ] }, h.label)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "container mx-auto px-4 py-16 md:py-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-primary", children: "Sports" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl font-bold md:text-4xl", children: "Pick your sport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Tap a sport to see venues near you." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sports", className: "group inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline", children: [
          "View all venues",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-10 grid grid-cols-2 gap-3 sm:gap-4", SPORT_GRID_COLS[Math.min(sports.length, 4)] ?? "sm:grid-cols-4", sports.length >= 5 && "lg:grid-cols-5"), children: sports.map((s) => {
        const cover = SPORT_COVER_IMAGES[s.slug] ?? null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sports", search: {
          sport: s.slug
        }, className: "group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-[border-color,box-shadow] duration-300 hover:border-primary hover:shadow-[var(--shadow-glow)] sm:aspect-square md:p-5", children: [
          cover ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cover, alt: "", loading: "lazy", decoding: "async", width: 600, height: 600, className: "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 grid place-items-center text-5xl", "aria-hidden": true, children: s.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-base font-semibold md:text-lg", children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary backdrop-blur transition-colors group-hover:bg-primary group-hover:text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
          ] })
        ] }, s.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "content-visibility-auto border-y border-border/60 bg-card/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-16 md:py-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-primary", children: "How it works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl font-bold md:text-4xl", children: "From search to kick-off in 3 steps" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-10 grid gap-4 md:grid-cols-3 md:gap-6", children: STEPS.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute right-6 top-5 font-display text-5xl font-bold text-foreground/5", "aria-hidden": true, children: [
          "0",
          i + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(step.icon, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-display text-xl font-semibold", children: step.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: step.desc })
      ] }, step.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "content-visibility-auto container mx-auto px-4 pt-16 md:pt-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-8 md:p-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-pitch pointer-events-none absolute inset-0 opacity-20", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold md:text-3xl", children: "Own a turf or court?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "List your venue on Good Bookies. Fill empty slots, take payments online and manage bookings from one dashboard." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-3 sm:w-auto sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "h-12 px-7", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/register", children: "List your venue" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "h-12 px-7", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/login", children: "Partner login" }) })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Index as component
};

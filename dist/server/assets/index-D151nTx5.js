import { Q as jsxRuntimeExports } from "./server-EQUGd4_X.js";
import { j as createLucideIcon, M as sportsQO, L as Link, B as Button } from "./router-D6g_ongO.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-4Uth_dBT.js";
import { m as motion } from "./proxy-BSLpC1k1.js";
import { M as MapPin } from "./map-pin-7oHUGcUT.js";
import { C as Calendar } from "./calendar-nQtRTM60.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-YrCWJfuS.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-BIdu4sxc.js";
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
const heroImg = "/assets/hero-turf-CXZg220g.jpg";
function Index() {
  const {
    data: sports
  } = useSuspenseQuery(sportsQO);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative isolate overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroImg, alt: "", width: 1920, height: 1080, className: "absolute inset-0 -z-10 h-full w-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-24 md:py-36", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.6
      }, className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }),
          " Real-time slot availability"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl", children: [
          "Book the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-turf", children: "pitch" }),
          ". Play the match."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-xl text-lg text-muted-foreground", children: "Floodlit turfs, cricket nets and indoor courts — find your slot, lock it in, and show up ready to play." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "glow-primary", children: "Book a fresh turf" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/lobbies", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", children: "Join an open match" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "container mx-auto px-4 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold md:text-4xl", children: "Pick your sport" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Tap a sport to see venues near you." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5", children: sports.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.3,
        delay: i * 0.07
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sports", search: {
        sport: s.slug
      }, className: "group flex aspect-square flex-col items-center justify-center rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl transition-transform group-hover:scale-110", children: s.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-3 text-sm font-semibold", children: s.name })
      ] }) }, s.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "container mx-auto px-4 py-20", children: [
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
      }].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, whileInView: {
        opacity: 1,
        y: 0
      }, viewport: {
        once: true
      }, transition: {
        delay: i * 0.1
      }, className: "rounded-2xl border border-border/60 bg-card p-6", children: [
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

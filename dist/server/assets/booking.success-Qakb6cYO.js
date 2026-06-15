import { Q as jsxRuntimeExports } from "./server-CsJ04WJg.js";
import { m as createLucideIcon, g as Route, L as Link, B as Button } from "./router-BTURENEi.js";
import { m as motion } from "./proxy-C5sbpe35.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-mpeOq5KX.js";
import "./index-BlRNeFf7.js";
import "./urls-Bbr6xyTd.js";
import "./auth-middleware-S1z3yl8j.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode);
function SuccessPage() {
  const {
    id
  } = Route.useSearch();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      scale: 0,
      rotate: -30
    }, animate: {
      scale: 1,
      rotate: 0
    }, transition: {
      type: "spring",
      stiffness: 200,
      damping: 12
    }, className: "grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-foreground glow-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.h1, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: 0.2
    }, className: "mt-6 font-display text-4xl font-bold", children: "Back of the net!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Payment received and your booking is confirmed. We've saved the slot for you." }),
    id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
      "Booking ID: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: id })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "default", children: "View my bookings" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "Book again" }) })
    ] })
  ] });
}
export {
  SuccessPage as component
};

import { _ as reactExports, Q as jsxRuntimeExports, O as Outlet } from "./server-CkN7nAyv.js";
import { j as createLucideIcon, T as useAuth, V as useNavigate, L as Link, g as cn } from "./router-NTbsnVdt.js";
import { u as useRouterState } from "./useRouterState-Fim-wLrd.js";
import { C as CalendarCheck } from "./calendar-check-Dfy_LVIo.js";
import { B as Bell } from "./bell-C4CpgUaG.js";
import { C as CreditCard } from "./credit-card-c6OqXqk_.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-BTPNIYzE.js";
import "./player-sports-D0yo17RI.js";
const __iconNode$1 = [
  ["path", { d: "M16 10h2", key: "8sgtl7" }],
  ["path", { d: "M16 14h2", key: "epxaof" }],
  ["path", { d: "M6.17 15a3 3 0 0 1 5.66 0", key: "n6f512" }],
  ["circle", { cx: "9", cy: "11", r: "2", key: "yxgjnd" }],
  ["rect", { x: "2", y: "5", width: "20", height: "14", rx: "2", key: "qneu4z" }]
];
const IdCard = createLucideIcon("id-card", __iconNode$1);
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
const nav = [{
  to: "/account",
  label: "My Bookings",
  icon: CalendarCheck,
  exact: true
}, {
  to: "/account/profile",
  label: "Profile",
  icon: User
}, {
  to: "/account/card",
  label: "My Player Card",
  icon: IdCard
}, {
  to: "/account/notifications",
  label: "Notifications",
  icon: Bell
}, {
  to: "/account/payments",
  label: "Payment History",
  icon: CreditCard
}];
function AccountLayout() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) navigate({
      to: "/login",
      search: {
        redirect: "/account"
      }
    });
  }, [loading, user, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-16 text-muted-foreground", children: "Loading…" });
  }
  const isCardPage = pathname === "/account/card";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("container mx-auto grid gap-6 px-3 py-6 sm:px-4 sm:py-8", isCardPage ? "max-w-7xl md:grid-cols-[200px_1fr]" : "md:grid-cols-[200px_1fr]"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "md:sticky md:top-20 md:self-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "My Account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-1", children: nav.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: n.to, className: cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(n.icon, { className: "h-4 w-4" }),
          n.label
        ] }, n.to);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
}
export {
  AccountLayout as component
};

import { Z as reactExports, P as jsxRuntimeExports, O as Outlet } from "./server-BUgKRY45.js";
import { j as createLucideIcon, T as useAuth, V as useNavigate, L as Link, g as cn } from "./router-DZRJpc5E.js";
import { u as useRouterState, C as CreditCard } from "./credit-card-Dgn_Ywhk.js";
import { a as ShieldAlert, L as LayoutDashboard, C as ChartColumn, S as Settings } from "./shield-alert-CrqOhIDA.js";
import { C as CalendarCheck } from "./calendar-check-B3wUuzJw.js";
import { B as Building2 } from "./building-2-CqXRMOjO.js";
import { T as Trophy } from "./trophy-Z4GriSq5.js";
import { U as Users } from "./users-CvSLx35-.js";
import { B as Bell } from "./bell-CdnIwHw3.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-D_JDeqRk.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-_1Ajsed4.js";
import "./player-sports-D0yo17RI.js";
const __iconNode$1 = [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "m9 14 2 2 4-4", key: "df797q" }]
];
const ClipboardCheck = createLucideIcon("clipboard-check", __iconNode$1);
const __iconNode = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode);
const nav = [{
  to: "/admin",
  label: "Overview",
  icon: LayoutDashboard,
  exact: true
}, {
  to: "/admin/bookings",
  label: "Bookings",
  icon: CalendarCheck
}, {
  to: "/admin/venues",
  label: "Venues",
  icon: Building2
}, {
  to: "/admin/sports",
  label: "Sports",
  icon: Trophy
}, {
  to: "/admin/users",
  label: "Users",
  icon: Users
}, {
  to: "/admin/payments",
  label: "Payments",
  icon: CreditCard
}, {
  to: "/admin/analytics",
  label: "Analytics",
  icon: ChartColumn
}, {
  to: "/admin/notifications",
  label: "Notifications",
  icon: Bell
}, {
  to: "/admin/owner-requests",
  label: "Owner requests",
  icon: UserCheck
}, {
  to: "/admin/venue-approvals",
  label: "Venue approvals",
  icon: ClipboardCheck
}, {
  to: "/admin/owners",
  label: "Owners",
  icon: Building2
}, {
  to: "/admin/settings",
  label: "Settings",
  icon: Settings
}];
function AdminLayout() {
  const {
    user,
    isAdmin,
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
        redirect: "/admin"
      }
    });
  }, [loading, user, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-16 text-muted-foreground", children: "Loading…" });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-12 w-12 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-2xl font-bold", children: "Admin access only" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Your account doesn't have permission to view this area." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 text-sm font-medium text-primary hover:underline", children: "← Back home" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[220px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "md:sticky md:top-20 md:self-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Admin" }),
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
  AdminLayout as component
};

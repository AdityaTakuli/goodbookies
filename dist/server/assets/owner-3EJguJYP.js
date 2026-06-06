import { Z as reactExports, P as jsxRuntimeExports, O as Outlet } from "./server-DhNrKN56.js";
import { j as createLucideIcon, T as useAuth, V as useNavigate, L as Link, g as cn } from "./router-RE29p4R8.js";
import { u as useRouterState } from "./useRouterState-Bv9t7APD.js";
import { u as useQuery } from "./useQuery-fAuGHRPz.js";
import { u as useServerFn } from "./useServerFn-Djo7pmAm.js";
import { g as getOwnerStatus } from "./owner.functions-CV6Pq5KO.js";
import { a as ShieldAlert, L as LayoutDashboard, C as ChartColumn, S as Settings } from "./shield-alert-MxNFQspW.js";
import { B as Building2 } from "./building-2-Ct-0ylll.js";
import { C as Calendar } from "./calendar-BD5ZvX0W.js";
import { I as IndianRupee } from "./indian-rupee-nMgjYUq_.js";
import { B as BadgeCheck } from "./badge-check-BqpwAwDk.js";
import { C as CreditCard } from "./credit-card-CrC0eq-V.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-4vxQ7zzM.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-BlN2ThZs.js";
const __iconNode = [
  [
    "path",
    {
      d: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
      key: "qn84l0"
    }
  ],
  ["path", { d: "M13 5v2", key: "dyzc3o" }],
  ["path", { d: "M13 17v2", key: "1ont0d" }],
  ["path", { d: "M13 11v2", key: "1wjjxi" }]
];
const Ticket = createLucideIcon("ticket", __iconNode);
const nav = [{
  to: "/owner",
  label: "Overview",
  icon: LayoutDashboard,
  exact: true
}, {
  to: "/owner/venues",
  label: "My Venues",
  icon: Building2
}, {
  to: "/owner/slots",
  label: "Slots",
  icon: Calendar
}, {
  to: "/owner/pricing",
  label: "Pricing & Offers",
  icon: IndianRupee
}, {
  to: "/owner/bookings",
  label: "Bookings",
  icon: Ticket
}, {
  to: "/owner/player-stats",
  label: "Verify Stats",
  icon: BadgeCheck
}, {
  to: "/owner/analytics",
  label: "Analytics",
  icon: ChartColumn
}, {
  to: "/owner/payouts",
  label: "Payouts",
  icon: CreditCard
}, {
  to: "/owner/settings",
  label: "Settings",
  icon: Settings
}];
function OwnerLayout() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const isPublicOwnerAuthPath = pathname === "/owner/login" || pathname === "/owner/login/" || pathname === "/owner/register" || pathname === "/owner/register/";
  const statusFn = useServerFn(getOwnerStatus);
  const {
    data: owner,
    isLoading: ownerLoading
  } = useQuery({
    queryKey: ["owner-status", user?.id],
    queryFn: () => statusFn(),
    enabled: !!user
  });
  reactExports.useEffect(() => {
    if (isPublicOwnerAuthPath) return;
    if (!loading && !user) navigate({
      to: "/owner/login"
    });
  }, [loading, user, navigate, isPublicOwnerAuthPath]);
  if (isPublicOwnerAuthPath) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }
  if (loading || ownerLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-16 text-muted-foreground", children: "Loading…" });
  }
  if (!user) {
    return null;
  }
  if (owner?.status !== "approved") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-12 w-12 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-2xl font-bold", children: "Partner access" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        owner?.status === "pending" && "Your application is under review.",
        owner?.status === "rejected" && (owner.rejection_reason ?? "Application not approved."),
        !owner && "No partner account found."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/register", className: "mt-6 text-sm font-medium text-primary hover:underline", children: "Apply to partner" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[220px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "md:sticky md:top-20 md:self-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Partner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 pb-2 text-sm font-medium truncate", children: owner.business_name || owner.name }),
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
  OwnerLayout as component
};

import { _ as reactExports, Q as jsxRuntimeExports, O as Outlet } from "./server-CZzkGOPq.js";
import { T as useAuth, V as useNavigate, L as Link } from "./router-rIGqCxo5.js";
import { T as Trophy } from "./trophy-DgRoaJaJ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./createSsrRpc-Bz86Q5Ja.js";
import "./auth-middleware-CATbE8JY.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
function ScoringLayout() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) navigate({
      to: "/login",
      search: {
        redirect: "/scoring"
      }
    });
  }, [loading, user, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-16 text-muted-foreground", children: "Loading…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[70vh] bg-[#0B130E]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-[#1E3A27] bg-[#0B130E]/90", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex items-center justify-between gap-4 px-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-lg font-bold text-white sm:text-xl", children: "Match Scoring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary sm:inline", children: "Free" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scoring/new", className: "text-sm font-medium text-primary hover:underline", children: "+ New match" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
}
export {
  ScoringLayout as component
};

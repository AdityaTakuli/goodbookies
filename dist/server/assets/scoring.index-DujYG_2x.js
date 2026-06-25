import { Q as jsxRuntimeExports } from "./server-BtWK4XFp.js";
import { d as Link, B as Button } from "./router-D3Z_xJ-z.js";
import { u as useQuery } from "./useQuery-DJs0F-T3.js";
import { u as useServerFn } from "./useServerFn-CX36Jbnz.js";
import { l as listMyScoringMatches } from "./scoring.functions-D5gGjkR6.js";
import { S as SPORT_CONFIGS } from "./player-sports-D0yo17RI.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./urls-B6y2hyXq.js";
import "./auth-middleware-C3Sj7DO6.js";
import "./types-DeUvCBv7.js";
import "./useBaseQuery-B93VXcdB.js";
function ScoringHome() {
  const listFn = useServerFn(listMyScoringMatches);
  const {
    data: matches = [],
    isLoading
  } = useQuery({
    queryKey: ["my-scoring-matches"],
    queryFn: () => listFn()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-white sm:text-3xl", children: "Score your matches" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/70", children: "Log in, build teams from registered players, and track cricket ball-by-ball or football goals. Stats appear on your player card, separate per sport." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scoring/new", className: "mt-4 inline-block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "glow-primary", children: "Start a new match" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold text-white", children: "Your match history" }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Loading…" }),
      !isLoading && matches.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-xl border border-dashed border-[#1E3A27] px-4 py-8 text-center text-sm text-muted-foreground", children: "No scored matches yet. Create one to get started." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2", children: matches.map((m) => {
        const sport = SPORT_CONFIGS[m.sportSlug];
        return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/scoring/$matchId", params: {
          matchId: m.id
        }, className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1E3A27] bg-[#142219] px-4 py-3 transition-colors hover:border-primary/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-white", children: [
              sport.icon,
              " ",
              m.teamAName,
              " vs ",
              m.teamBName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              m.matchDate,
              " · ",
              m.status,
              " · ",
              m.players.length,
              " players"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-primary", children: m.status })
        ] }) }, m.id);
      }) })
    ] })
  ] });
}
export {
  ScoringHome as component
};

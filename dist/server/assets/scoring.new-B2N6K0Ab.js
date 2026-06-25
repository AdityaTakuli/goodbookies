import { _ as reactExports, Q as jsxRuntimeExports } from "./server-DdAqLsIT.js";
import { B as Button, a8 as toast, ac as useNavigate } from "./router-JEC9pPAI.js";
import { u as useServerFn } from "./useServerFn-CgTAoIS4.js";
import { s as searchScoringPlayers, a as createScoringMatch, e as startScoringMatch } from "./scoring.functions-C63RcYCd.js";
import { I as Input } from "./input-YAvtwc5h.js";
import { F as FOOTBALL_LENGTHS } from "./types-IRb4ym3m.js";
import { L as Label } from "./label-CPg_51kT.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./urls-C0tDnBhe.js";
import "./auth-middleware-DlMFU7bu.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
function PlayerSearch({
  team,
  squad,
  onAdd
}) {
  const searchFn = useServerFn(searchScoringPlayers);
  const [q, setQ] = reactExports.useState("");
  const [results, setResults] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const search = async () => {
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const rows = await searchFn({ data: { q: q.trim() } });
      setResults(rows);
      if (!rows.length) toast.message("No players found. Try username or phone.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };
  const add = (row) => {
    if (squad.some((p) => p.userId === row.id)) {
      toast.error("Player already in squad");
      return;
    }
    onAdd({
      userId: row.id,
      team,
      displayName: row.fullName,
      username: row.username
    });
    setResults([]);
    setQ("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search username or phone…",
          value: q,
          onChange: (e) => setQ(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), search())
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: search, disabled: loading, children: loading ? "…" : "Search" })
    ] }),
    results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y rounded-xl border border-border/60 bg-card", children: results.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-2 px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium truncate", children: r.fullName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          r.username ? `@${r.username}` : "N/A",
          r.phone ? ` · ${r.phone}` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", onClick: () => add(r), children: "Add" })
    ] }, r.id)) })
  ] });
}
function NewScoringMatch() {
  const navigate = useNavigate();
  const createFn = useServerFn(createScoringMatch);
  const startFn = useServerFn(startScoringMatch);
  const [sport, setSport] = reactExports.useState("cricket");
  const [teamA, setTeamA] = reactExports.useState("Team A");
  const [teamB, setTeamB] = reactExports.useState("Team B");
  const [overs, setOvers] = reactExports.useState(10);
  const [gameLength, setGameLength] = reactExports.useState(60);
  const [squad, setSquad] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const addPlayer = (p) => setSquad((prev) => [...prev, p]);
  const removePlayer = (userId) => setSquad((prev) => prev.filter((p) => p.userId !== userId));
  const submit = async (e) => {
    e.preventDefault();
    if (squad.length < 2) {
      toast.error("Add at least 2 registered players");
      return;
    }
    setLoading(true);
    try {
      const match = await createFn({
        data: {
          sport,
          teamAName: teamA.trim(),
          teamBName: teamB.trim(),
          totalOvers: sport === "cricket" ? overs : void 0,
          gameLengthMinutes: sport === "football" ? gameLength : void 0,
          players: squad
        }
      });
      await startFn({
        data: {
          matchId: match.id
        }
      });
      toast.success("Match started!");
      navigate({
        to: "/scoring/$matchId",
        params: {
          matchId: match.id
        }
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create match");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mx-auto max-w-2xl space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-white", children: "New match" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Only registered Good Bookies players can be added." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["cricket", "football"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSport(s), className: `rounded-full px-4 py-2 text-sm font-semibold ${sport === s ? "bg-primary text-primary-foreground" : "bg-[#142219] text-muted-foreground"}`, children: s === "cricket" ? "🏏 Cricket" : "⚽ Football" }, s)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Team A name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: teamA, onChange: (e) => setTeamA(e.target.value), className: "mt-1", required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Team B name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: teamB, onChange: (e) => setTeamB(e.target.value), className: "mt-1", required: true })
      ] })
    ] }),
    sport === "cricket" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overs per innings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 50, value: overs, onChange: (e) => setOvers(Number(e.target.value)), className: "mt-1 max-w-[120px]" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Game length (minutes)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "mt-1 h-10 rounded-lg border border-input bg-background px-3 text-sm", value: gameLength, onChange: (e) => setGameLength(Number(e.target.value)), children: FOOTBALL_LENGTHS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: m, children: [
        m,
        " minutes"
      ] }, m)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-[#1E3A27] bg-[#142219] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-white", children: teamA }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerSearch, { team: "a", squad, onAdd: addPlayer })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-[#1E3A27] bg-[#142219] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-white", children: teamB }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerSearch, { team: "b", squad, onAdd: addPlayer })
      ] })
    ] }),
    squad.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y rounded-xl border border-border/60 bg-card", children: squad.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        p.displayName,
        p.username ? ` @${p.username}` : "",
        " · Team ",
        p.team.toUpperCase()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removePlayer(p.userId), children: "Remove" })
    ] }, p.userId)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating…" : "Create & start scoring" })
  ] });
}
export {
  NewScoringMatch as component
};

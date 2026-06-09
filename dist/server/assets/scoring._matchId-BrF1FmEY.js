import { Q as jsxRuntimeExports, _ as reactExports } from "./server-LuOkuWjo.js";
import { B as Button, _ as toast, e as Route, a3 as useQueryClient, L as Link } from "./router-BBYYQ2lv.js";
import { u as useQuery } from "./useQuery-B5tOPvip.js";
import { u as useServerFn } from "./useServerFn-CkRnwERD.js";
import { r as recordCricketBall, u as undoScoringCricketBall, c as completeScoringMatch, d as recordFootballGoal, g as getScoringMatch } from "./scoring.functions-BWs4k8YS.js";
import { C as CRICKET_BALL_BUTTONS } from "./types-IRb4ym3m.js";
import { d as cricketOversDisplay } from "./cricket-engine-B8C0PNEx.js";
import { I as Input } from "./input-uH634T1q.js";
import { L as Label } from "./label-DWxVIR7I.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-DwJiWB12.js";
import "./auth-middleware-LtNy3EFU.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-BSLIXh6z.js";
import "./client.server-CQTuKCic.js";
function CricketScorer({
  match,
  onUpdate
}) {
  const ballFn = useServerFn(recordCricketBall);
  const undoFn = useServerFn(undoScoringCricketBall);
  const completeFn = useServerFn(completeScoringMatch);
  const state = match.state;
  const innings = state.innings === 1 ? state.innings1 : state.innings2;
  const battingTeam = innings.battingTeam === "a" ? match.teamAName : match.teamBName;
  const teamPlayers = match.players.filter((p) => p.team === innings.battingTeam);
  const bowlerPlayers = match.players.filter((p) => p.team !== innings.battingTeam);
  const record = async (outcome) => {
    try {
      const updated = await ballFn({
        data: {
          matchId: match.id,
          outcome,
          batsmanId: innings.strikerId ?? teamPlayers[0]?.userId,
          bowlerId: innings.bowlerId ?? bowlerPlayers[0]?.userId,
          wicketType: outcome === "wicket" ? "out" : void 0
        }
      });
      onUpdate(updated);
      if (updated.status === "completed") toast.success("Match completed!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record ball");
    }
  };
  const undo = async () => {
    try {
      onUpdate(await undoFn({ data: { matchId: match.id } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Undo failed");
    }
  };
  const finish = async () => {
    try {
      onUpdate(await completeFn({ data: { matchId: match.id } }));
      toast.success("Match saved to history");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not finish");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1E3A27] bg-[#142219] p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs uppercase tracking-wider text-primary", children: [
        "Innings ",
        state.innings
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold", children: battingTeam }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 font-display text-4xl font-bold text-primary", children: [
        innings.score,
        "/",
        innings.wickets,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-3 text-lg text-muted-foreground", children: [
          "(",
          cricketOversDisplay(innings),
          " ov)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: CRICKET_BALL_BUTTONS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        variant: b.outcome === "wicket" ? "destructive" : "outline",
        className: "h-12 text-sm font-semibold",
        onClick: () => record(b.outcome),
        disabled: match.status !== "live",
        children: b.label
      },
      b.outcome
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", onClick: undo, disabled: match.status !== "live", children: "Undo last ball" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: finish, disabled: match.status === "completed", children: "End match" })
    ] })
  ] });
}
function FootballScorer({
  match,
  onUpdate
}) {
  const goalFn = useServerFn(recordFootballGoal);
  const completeFn = useServerFn(completeScoringMatch);
  const [minute, setMinute] = reactExports.useState(1);
  const [scorerId, setScorerId] = reactExports.useState(match.players[0]?.userId ?? "");
  const state = match.state;
  const addGoal = async (team) => {
    const player = match.players.find((p) => p.userId === scorerId);
    if (!player) {
      toast.error("Select a scorer");
      return;
    }
    try {
      const updated = await goalFn({
        data: {
          matchId: match.id,
          team,
          playerId: player.userId,
          playerName: player.displayName,
          minute
        }
      });
      onUpdate(updated);
      if (updated.status === "completed") toast.success("Full time. Match saved!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record goal");
    }
  };
  const finish = async () => {
    try {
      onUpdate(await completeFn({ data: { matchId: match.id } }));
      toast.success("Match saved to history");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not finish");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1E3A27] bg-[#142219] p-4 text-center sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        state.gameLengthMinutes,
        " min match"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 font-display text-4xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: state.teamAScore }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-4 text-muted-foreground", children: "–" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: state.teamBScore })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        match.teamAName,
        " vs ",
        match.teamBName,
        " · ",
        state.elapsedMinute,
        "'"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Minute" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            max: state.gameLengthMinutes,
            value: minute,
            onChange: (e) => setMinute(Number(e.target.value)),
            className: "mt-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scorer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            className: "mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
            value: scorerId,
            onChange: (e) => setScorerId(e.target.value),
            children: match.players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.userId, children: [
              p.displayName,
              " (",
              p.team === "a" ? match.teamAName : match.teamBName,
              ")"
            ] }, p.userId))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => addGoal("a"), disabled: match.status !== "live", children: [
        "Goal: ",
        match.teamAName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => addGoal("b"), disabled: match.status !== "live", children: [
        "Goal: ",
        match.teamBName
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", onClick: finish, disabled: match.status === "completed", children: "End match" })
  ] });
}
function ScoringMatchPage() {
  const {
    matchId
  } = Route.useParams();
  const qc = useQueryClient();
  const getFn = useServerFn(getScoringMatch);
  const {
    data: match,
    isLoading
  } = useQuery({
    queryKey: ["scoring-match", matchId],
    queryFn: () => getFn({
      data: {
        matchId
      }
    })
  });
  const onUpdate = (m) => {
    qc.setQueryData(["scoring-match", matchId], m);
    qc.invalidateQueries({
      queryKey: ["my-scoring-matches"]
    });
  };
  if (isLoading || !match) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading match…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-primary", children: match.sportSlug }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-bold text-white", children: [
          match.teamAName,
          " vs ",
          match.teamBName
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scoring", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "← All matches" }) })
    ] }),
    match.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary", children: "Match completed. Stats saved to each player's profile (this sport only)." }),
    match.sportSlug === "cricket" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CricketScorer, { match, onUpdate }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FootballScorer, { match, onUpdate })
  ] });
}
export {
  ScoringMatchPage as component
};

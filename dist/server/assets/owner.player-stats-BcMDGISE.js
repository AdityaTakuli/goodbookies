import { l as createServerFn, _ as reactExports, Q as jsxRuntimeExports } from "./server-CorN6qw5.js";
import { u as useQuery } from "./useQuery-l73bW2nc.js";
import { a3 as useQueryClient, j as cn, B as Button, _ as toast } from "./router-EbU1nqEp.js";
import { u as useServerFn } from "./useServerFn-CHx2_dnm.js";
import { c as createSsrRpc } from "./urls-D-Qa20da.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DcElV_TJ.js";
import { P as PLAYER_SPORT_SLUGS, S as SPORT_CONFIGS, V as VERIFIED_STAT_KEYS } from "./player-sports-D0yo17RI.js";
import { o as objectType, s as stringType, n as numberType, r as recordType, e as enumType } from "./types-DeUvCBv7.js";
import { I as Input } from "./input-cUR-XHHk.js";
import { L as Label } from "./label-CF4Y9cXr.js";
import { B as BadgeCheck } from "./badge-check-CQE_5D52.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-B9ekEVlR.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
const sportSchema = enumType(PLAYER_SPORT_SLUGS);
const verifySchema = objectType({
  playerUserId: stringType().uuid(),
  venueId: stringType().uuid(),
  sport: sportSchema,
  bookingId: stringType().uuid().optional(),
  matchDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  statsPayload: recordType(stringType(), numberType().nonnegative()),
  // Match history scoreline
  teamName: stringType().min(1).max(120),
  teamIcon: stringType().max(16).optional(),
  playerScore: numberType().int().min(0),
  opponentName: stringType().min(1).max(120),
  opponentIcon: stringType().max(16).optional(),
  opponentScore: numberType().int().min(0),
  notes: stringType().max(500).optional()
});
const ownerListVenuesForStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("42965ee81dff5a7450555048a069263e4294afeb0ba97b60c6a58b1a41b56a22"));
const ownerLookupPlayerByUsername = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  username: stringType().min(3).max(30)
}).parse(input)).handler(createSsrRpc("2ab013211392959ba12dab213e93e7cef2ac367e0b98b50bac4ed4ac2a57b567"));
const ownerVerifyPlayerStats = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => verifySchema.parse(input)).handler(createSsrRpc("bfbbcdd84aff9f7b493d3075dda3691157d72fc61a7cadd305a0af1d483e9916"));
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function defaultStatsForSport(sport) {
  const keys = VERIFIED_STAT_KEYS[sport];
  return Object.fromEntries(keys.map((k) => [k, k === "matches" ? 1 : 0]));
}
function OwnerPlayerStats() {
  const venuesFn = useServerFn(ownerListVenuesForStats);
  const lookupFn = useServerFn(ownerLookupPlayerByUsername);
  const verifyFn = useServerFn(ownerVerifyPlayerStats);
  const qc = useQueryClient();
  const [sport, setSport] = reactExports.useState("football");
  const {
    data: venues
  } = useQuery({
    queryKey: ["owner-stats-venues"],
    queryFn: () => venuesFn()
  });
  const [username, setUsername] = reactExports.useState("");
  const [player, setPlayer] = reactExports.useState(null);
  const [venueId, setVenueId] = reactExports.useState("");
  const [matchDate, setMatchDate] = reactExports.useState(todayISO());
  const [stats, setStats] = reactExports.useState(defaultStatsForSport("football"));
  const [teamName, setTeamName] = reactExports.useState("");
  const [opponentName, setOpponentName] = reactExports.useState("Opponents");
  const [playerScore, setPlayerScore] = reactExports.useState(0);
  const [opponentScore, setOpponentScore] = reactExports.useState(0);
  const [notes, setNotes] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const sportVenues = (venues ?? []).filter((v) => !v.sport?.slug || v.sport.slug === sport);
  const lookup = async () => {
    if (!username.trim()) return;
    try {
      const p = await lookupFn({
        data: {
          username: username.trim().toLowerCase()
        }
      });
      setPlayer(p);
      toast.success(`Found ${p.full_name || p.username}`);
    } catch (e) {
      setPlayer(null);
      toast.error(e.message);
    }
  };
  const submit = async () => {
    if (!player || !venueId) {
      toast.error("Select a player and turf");
      return;
    }
    setBusy(true);
    try {
      await verifyFn({
        data: {
          playerUserId: player.id,
          venueId,
          sport,
          matchDate,
          statsPayload: stats,
          teamName: teamName || player.full_name || "Home",
          playerScore,
          opponentName,
          opponentScore,
          notes: notes || void 0
        }
      });
      toast.success("Verified stats + match scoreline recorded");
      setStats(defaultStatsForSport(sport));
      setPlayerScore(0);
      setOpponentScore(0);
      setNotes("");
      qc.invalidateQueries({
        queryKey: ["owner-stats-venues"]
      });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 font-display text-3xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-8 w-8 text-primary" }),
        "Verify player stats"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-2xl text-sm text-muted-foreground", children: "Turf owners only. This is the verified write path. Players cannot edit match stats. Adds scoreline to match history." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: PLAYER_SPORT_SLUGS.map((slug) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
      setSport(slug);
      setStats(defaultStatsForSport(slug));
    }, className: cn("rounded-full px-3 py-1.5 text-sm font-semibold", sport === slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"), children: [
      SPORT_CONFIGS[slug].icon,
      " ",
      SPORT_CONFIGS[slug].name
    ] }, slug)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl space-y-4 rounded-2xl border border-primary/30 bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Player username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: username, onChange: (e) => setUsername(e.target.value), placeholder: "aditya-striker" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: lookup, children: "Find" })
        ] }),
        player && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          player.full_name || "Player",
          " · @",
          player.username
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Your turf" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: venueId, onChange: (e) => setVenueId(e.target.value), className: "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select venue" }),
          sportVenues.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: v.id, children: [
            v.name,
            " · ",
            v.city
          ] }, v.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Match date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: matchDate, onChange: (e) => setMatchDate(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-2 block", children: [
          "Verified stats (",
          sport,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: VERIFIED_STAT_KEYS[sport].map((key) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs capitalize", children: key.replace("_", " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: stats[key] ?? 0, onChange: (e) => setStats((prev) => ({
            ...prev,
            [key]: Number(e.target.value)
          })) })
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Match scoreline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Team name", value: teamName, onChange: (e) => setTeamName(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Opponent", value: opponentName, onChange: (e) => setOpponentName(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, placeholder: "Your score", value: playerScore, onChange: (e) => setPlayerScore(Number(e.target.value)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, placeholder: "Opponent score", value: opponentScore, onChange: (e) => setOpponentScore(Number(e.target.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: notes, onChange: (e) => setNotes(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy || !player, children: busy ? "Saving…" : "Record verified match" })
    ] })
  ] });
}
export {
  OwnerPlayerStats as component
};

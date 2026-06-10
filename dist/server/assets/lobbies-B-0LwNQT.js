import { _ as reactExports, Q as jsxRuntimeExports } from "./server-D-FpydCZ.js";
import { a0 as useAuth, a2 as useNavigate, a3 as useQueryClient, A as listSports, L as Link, B as Button, _ as toast } from "./router-NJsRcLhW.js";
import { u as useQuery } from "./useQuery-BrTYnNRX.js";
import { u as useServerFn } from "./useServerFn-VP9lZotl.js";
import { b as listOpenLobbies, s as submitLobbyQuery } from "./lobby.functions-rxBZhbC6.js";
import { m as motion } from "./proxy-CwAi8PB7.js";
import { M as MapPin } from "./map-pin-CA7W3p_I.js";
import { C as Calendar } from "./calendar-IDZgfjFM.js";
import { U as Users } from "./users-BtZjneoo.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-mpeOq5KX.js";
import "./index-BlRNeFf7.js";
import "./urls-BL7zzYFV.js";
import "./auth-middleware-CA7u2ea1.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-Cjn6a3a2.js";
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function LobbiesPage() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listOpenLobbies);
  const submitFn = useServerFn(submitLobbyQuery);
  const [sport, setSport] = reactExports.useState("");
  const [date, setDate] = reactExports.useState(todayISO());
  const [joinId, setJoinId] = reactExports.useState(null);
  const [playerCount, setPlayerCount] = reactExports.useState(1);
  const [playerNames, setPlayerNames] = reactExports.useState([""]);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const {
    data: sports
  } = useQuery({
    queryKey: ["sports"],
    queryFn: () => listSports()
  });
  const {
    data: lobbies,
    isLoading
  } = useQuery({
    queryKey: ["open-lobbies", sport, date],
    queryFn: () => listFn({
      data: {
        sport: sport || void 0,
        date
      }
    }),
    refetchInterval: 5e3
  });
  const active = joinId ? (lobbies ?? []).find((l) => l.id === joinId) : null;
  const maxJoin = active ? Math.min(active.spots_open, 20) : 1;
  const openJoin = (lobby) => {
    if (!user) {
      toast.info("Sign in to request a spot");
      navigate({
        to: "/login",
        search: {
          redirect: "/lobbies"
        }
      });
      return;
    }
    setJoinId(lobby.id);
    setPlayerCount(1);
    setPlayerNames([""]);
  };
  const submitJoin = async () => {
    if (!joinId || !active) return;
    const names = playerNames.map((n) => n.trim());
    if (names.some((n) => !n)) {
      toast.error("Enter all player names");
      return;
    }
    setSubmitting(true);
    try {
      await submitFn({
        data: {
          bookingId: joinId,
          playerCount,
          playerNames: names
        }
      });
      toast.success("Request sent! The host will review your application.");
      setJoinId(null);
      qc.invalidateQueries({
        queryKey: ["open-lobbies"]
      });
      qc.invalidateQueries({
        queryKey: ["my-lobby-queries"]
      });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold", children: "Open matches" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Join games that still need players. Pay your share only after the host accepts." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: sport, onChange: (e) => setSport(e.target.value), className: "h-10 rounded-lg border border-input bg-background px-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All sports" }),
        (sports ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.slug, children: [
          s.icon,
          " ",
          s.name
        ] }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: date, min: todayISO(), onChange: (e) => setDate(e.target.value), className: "h-10 rounded-lg border border-input bg-background px-3 text-sm" })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-muted-foreground", children: "Loading open matches…" }),
    !isLoading && !lobbies?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-2xl border border-border/60 bg-card p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No open matches right now." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-4", children: "Book a turf and open your match" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-4 md:grid-cols-2", children: (lobbies ?? []).map((lobby, i) => {
      const filled = lobby.player_count ?? 0;
      const total = lobby.spots_total;
      const pct = Math.round(filled / total * 100);
      const hostName = lobby.host?.full_name || lobby.host?.email || "Host";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: i * 0.04
      }, className: "rounded-2xl border border-border/60 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: lobby.venue?.sport?.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: lobby.venue?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Host: ",
              hostName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary", children: [
            lobby.spots_open,
            " open"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
            lobby.venue?.city
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
            lobby.booking_date,
            " · ",
            lobby.start_hour,
            ":00"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
              filled,
              "/",
              total,
              " players"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              lobby.spots_open,
              " spots left"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-2 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: {
            width: `${pct}%`
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-4 w-full", onClick: () => openJoin(lobby), children: "Request to join match" })
      ] }, lobby.id);
    }) }),
    joinId && active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-xl font-bold", children: [
        "Join ",
        active.venue?.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        active.booking_date,
        " at ",
        active.start_hour,
        ":00 · up to ",
        active.spots_open,
        " players"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mt-4 block text-sm font-semibold", children: "How many players?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: playerCount, onChange: (e) => {
        const n = Number(e.target.value);
        setPlayerCount(n);
        setPlayerNames(Array.from({
          length: n
        }, (_, i) => playerNames[i] ?? ""));
      }, className: "mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm", children: Array.from({
        length: maxJoin
      }, (_, i) => i + 1).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n, children: n }, n)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid gap-2", children: playerNames.map((name, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, placeholder: `Player ${idx + 1}`, onChange: (e) => {
        const next = [...playerNames];
        next[idx] = e.target.value;
        setPlayerNames(next);
      }, className: "h-10 rounded-lg border border-input bg-background px-3 text-sm" }, idx)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setJoinId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "flex-1", disabled: submitting, onClick: submitJoin, children: submitting ? "Sending…" : "Send request" })
      ] })
    ] }) })
  ] });
}
export {
  LobbiesPage as component
};

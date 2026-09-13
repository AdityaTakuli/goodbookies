import { _ as reactExports, Q as jsxRuntimeExports } from "./server-BDxa_Kju.js";
import { ad as useAuth, af as useNavigate, ag as useQueryClient, O as listSports, B as Button, d as Link, ab as toast } from "./router-Dbk61_Mg.js";
import { u as useQuery } from "./useQuery-Pc9p_Eho.js";
import { u as useServerFn } from "./useServerFn-BY9fJtg0.js";
import { b as listOpenLobbies, s as submitLobbyQuery } from "./lobby.functions-3mxHC6cs.js";
import { M as MapPin } from "./map-pin-3AP1afNS.js";
import { C as Calendar } from "./calendar-DntYvLjE.js";
import { U as Users } from "./users-RhXqydkB.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-ChthLJ-h.js";
import "./auth-middleware-CXeE-dWU.js";
import "./cancellation-policy-CDWg5dXD.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-D_dntZRf.js";
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
  reactExports.useEffect(() => {
    if (!joinId) return;
    const onKey = (e) => e.key === "Escape" && setJoinId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [joinId]);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10 md:py-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-primary", children: "Play with others" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl font-bold md:text-5xl", children: "Open matches" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Join games that still need players. Pay your share only after the host accepts." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: sport, onChange: (e) => setSport(e.target.value), "aria-label": "Filter by sport", className: "h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm sm:flex-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All sports" }),
        (sports ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.slug, children: [
          s.icon,
          " ",
          s.name
        ] }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: date, min: todayISO(), onChange: (e) => setDate(e.target.value), "aria-label": "Match date", className: "h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm sm:flex-none" })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-4 md:grid-cols-2", "aria-busy": "true", "aria-label": "Loading open matches", children: [0, 1, 2, 3].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 animate-pulse rounded-2xl border border-border/60 bg-card" }, k)) }),
    !isLoading && !lobbies?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-semibold", children: "No open matches for this day" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Try another date or sport, or start your own game." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", children: "Book a turf and open your match" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-4 md:grid-cols-2", children: (lobbies ?? []).map((lobby, i) => {
      const filled = lobby.player_count ?? 0;
      const total = lobby.spots_total;
      const pct = Math.round(filled / total * 100);
      const hostName = lobby.host?.full_name || lobby.host?.email || "Host";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        "--rise-delay": `${Math.min(i, 8) * 40}ms`
      }, className: "animate-rise rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/50", children: [
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
    joinId && active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center", onClick: (e) => e.target === e.currentTarget && setJoinId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": "join-lobby-title", className: "animate-rise max-h-[90svh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { id: "join-lobby-title", className: "font-display text-xl font-bold", children: [
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

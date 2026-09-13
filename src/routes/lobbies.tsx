import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { listOpenLobbies, submitLobbyQuery } from "@/lib/lobby.functions";
import { listSports } from "@/lib/booking.functions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/lobbies")({
  head: () =>
    buildPageMeta({
      title: "Open Match Lobbies",
      description:
        "Find open match lobbies and join games near you. Filter by sport and date, then request to fill remaining spots on booked turf slots.",
      path: "/lobbies",
    }),
  component: LobbiesPage,
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function LobbiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listOpenLobbies);
  const submitFn = useServerFn(submitLobbyQuery);

  const [sport, setSport] = useState<string>("");
  const [date, setDate] = useState(todayISO());
  const [joinId, setJoinId] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const { data: sports } = useQuery({ queryKey: ["sports"], queryFn: () => listSports() });
  const { data: lobbies, isLoading } = useQuery({
    queryKey: ["open-lobbies", sport, date],
    queryFn: () => listFn({ data: { sport: sport || undefined, date } }),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!joinId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setJoinId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [joinId]);

  const active = joinId ? (lobbies ?? []).find((l: any) => l.id === joinId) : null;
  const maxJoin = active ? Math.min(active.spots_open, 20) : 1;

  const openJoin = (lobby: any) => {
    if (!user) {
      toast.info("Sign in to request a spot");
      navigate({ to: "/login", search: { redirect: "/lobbies" } });
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
        data: { bookingId: joinId, playerCount, playerNames: names },
      });
      toast.success("Request sent! The host will review your application.");
      setJoinId(null);
      qc.invalidateQueries({ queryKey: ["open-lobbies"] });
      qc.invalidateQueries({ queryKey: ["my-lobby-queries"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Play with others</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Open matches</h1>
        <p className="mt-2 text-muted-foreground">
          Join games that still need players. Pay your share only after the host accepts.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          aria-label="Filter by sport"
          className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm sm:flex-none"
        >
          <option value="">All sports</option>
          {(sports ?? []).map((s) => (
            <option key={s.id} value={s.slug}>{s.icon} {s.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          min={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Match date"
          className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm sm:flex-none"
        />
      </div>

      {isLoading && (
        <div className="mt-8 grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading open matches">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="h-56 animate-pulse rounded-2xl border border-border/60 bg-card" />
          ))}
        </div>
      )}

      {!isLoading && !(lobbies?.length) && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold">No open matches for this day</p>
          <p className="mt-2 text-sm text-muted-foreground">Try another date or sport, or start your own game.</p>
          <Button asChild className="mt-6">
            <Link to="/sports">Book a turf and open your match</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(lobbies ?? []).map((lobby: any, i: number) => {
          const filled = lobby.player_count ?? 0;
          const total = lobby.spots_total;
          const pct = Math.round((filled / total) * 100);
          const hostName = lobby.host?.full_name || lobby.host?.email || "Host";
          return (
            <div
              key={lobby.id}
              style={{ "--rise-delay": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}
              className="animate-rise rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-lg">{lobby.venue?.sport?.icon}</span>
                  <h3 className="font-display text-lg font-semibold">{lobby.venue?.name}</h3>
                  <p className="text-sm text-muted-foreground">Host: {hostName}</p>
                </div>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  {lobby.spots_open} open
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{lobby.venue?.city}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{lobby.booking_date} · {lobby.start_hour}:00</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{filled}/{total} players</span>
                  <span>{lobby.spots_open} spots left</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <Button className="mt-4 w-full" onClick={() => openJoin(lobby)}>
                Request to join match
              </Button>
            </div>
          );
        })}
      </div>

      {joinId && active && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => e.target === e.currentTarget && setJoinId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-lobby-title"
            className="animate-rise max-h-[90svh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <h3 id="join-lobby-title" className="font-display text-xl font-bold">Join {active.venue?.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {active.booking_date} at {active.start_hour}:00 · up to {active.spots_open} players
            </p>
            <label className="mt-4 block text-sm font-semibold">How many players?</label>
            <select
              value={playerCount}
              onChange={(e) => {
                const n = Number(e.target.value);
                setPlayerCount(n);
                setPlayerNames(Array.from({ length: n }, (_, i) => playerNames[i] ?? ""));
              }}
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {Array.from({ length: maxJoin }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <div className="mt-3 grid gap-2">
              {playerNames.map((name, idx) => (
                <input
                  key={idx}
                  value={name}
                  placeholder={`Player ${idx + 1}`}
                  onChange={(e) => {
                    const next = [...playerNames];
                    next[idx] = e.target.value;
                    setPlayerNames(next);
                  }}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setJoinId(null)}>Cancel</Button>
              <Button className="flex-1" disabled={submitting} onClick={submitJoin}>
                {submitting ? "Sending…" : "Send request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import {
  ownerListVenuesForStats,
  ownerLookupPlayerByUsername,
  ownerVerifyPlayerStats,
} from "@/lib/owner-player-stats.functions";
import { PLAYER_SPORT_SLUGS, SPORT_CONFIGS, VERIFIED_STAT_KEYS, type PlayerSportSlug } from "@/lib/sports/player-sports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/player-stats")({
  component: OwnerPlayerStats,
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultStatsForSport(sport: PlayerSportSlug) {
  const keys = VERIFIED_STAT_KEYS[sport];
  return Object.fromEntries(keys.map((k) => [k, k === "matches" ? 1 : 0]));
}

function OwnerPlayerStats() {
  const venuesFn = useServerFn(ownerListVenuesForStats);
  const lookupFn = useServerFn(ownerLookupPlayerByUsername);
  const verifyFn = useServerFn(ownerVerifyPlayerStats);
  const qc = useQueryClient();

  const [sport, setSport] = useState<PlayerSportSlug>("football");
  const { data: venues } = useQuery({ queryKey: ["owner-stats-venues"], queryFn: () => venuesFn() });

  const [username, setUsername] = useState("");
  const [player, setPlayer] = useState<{ id: string; username: string; full_name: string | null } | null>(null);
  const [venueId, setVenueId] = useState("");
  const [matchDate, setMatchDate] = useState(todayISO());
  const [stats, setStats] = useState<Record<string, number>>(defaultStatsForSport("football"));
  const [teamName, setTeamName] = useState("");
  const [opponentName, setOpponentName] = useState("Opponents");
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const sportVenues = (venues ?? []).filter((v: any) => !v.sport?.slug || v.sport.slug === sport);

  const lookup = async () => {
    if (!username.trim()) return;
    try {
      const p = await lookupFn({ data: { username: username.trim().toLowerCase() } });
      setPlayer(p);
      toast.success(`Found ${p.full_name || p.username}`);
    } catch (e: any) {
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
          notes: notes || undefined,
        },
      });
      toast.success("Verified stats + match scoreline recorded");
      setStats(defaultStatsForSport(sport));
      setPlayerScore(0);
      setOpponentScore(0);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["owner-stats-venues"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <BadgeCheck className="h-8 w-8 text-primary" />
          Verify player stats
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Turf owners only. This is the verified write path. Players cannot edit match stats. Adds scoreline to match history.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLAYER_SPORT_SLUGS.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => { setSport(slug); setStats(defaultStatsForSport(slug)); }}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold",
              sport === slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {SPORT_CONFIGS[slug].icon} {SPORT_CONFIGS[slug].name}
          </button>
        ))}
      </div>

      <div className="max-w-xl space-y-4 rounded-2xl border border-primary/30 bg-card p-6">
        <div className="grid gap-1.5">
          <Label>Player username</Label>
          <div className="flex gap-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="aditya-striker" />
            <Button type="button" variant="outline" onClick={lookup}>Find</Button>
          </div>
          {player && <p className="text-sm text-muted-foreground">{player.full_name || "Player"} · @{player.username}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label>Your turf</Label>
          <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
            <option value="">Select venue</option>
            {sportVenues.map((v: any) => (
              <option key={v.id} value={v.id}>{v.name} · {v.city}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label>Match date</Label>
          <Input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
        </div>

        <div>
          <Label className="mb-2 block">Verified stats ({sport})</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VERIFIED_STAT_KEYS[sport].map((key) => (
              <div key={key}>
                <Label className="text-xs capitalize">{key.replace("_", " ")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={stats[key] ?? 0}
                  onChange={(e) => setStats((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 p-4">
          <Label className="mb-2 block">Match scoreline</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            <Input placeholder="Opponent" value={opponentName} onChange={(e) => setOpponentName(e.target.value)} />
            <Input type="number" min={0} placeholder="Your score" value={playerScore} onChange={(e) => setPlayerScore(Number(e.target.value))} />
            <Input type="number" min={0} placeholder="Opponent score" value={opponentScore} onChange={(e) => setOpponentScore(Number(e.target.value))} />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Notes (optional)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <Button onClick={submit} disabled={busy || !player}>{busy ? "Saving…" : "Record verified match"}</Button>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createScoringMatch, startScoringMatch } from "@/lib/scoring/scoring.functions";
import { PlayerSearch, type SquadPlayer } from "@/components/scoring/PlayerSearch";
import { FOOTBALL_LENGTHS } from "@/lib/scoring/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/scoring/new")({
  component: NewScoringMatch,
});

function NewScoringMatch() {
  const navigate = useNavigate();
  const createFn = useServerFn(createScoringMatch);
  const startFn = useServerFn(startScoringMatch);

  const [sport, setSport] = useState<"cricket" | "football">("cricket");
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");
  const [overs, setOvers] = useState(10);
  const [gameLength, setGameLength] = useState(60);
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  const addPlayer = (p: SquadPlayer) => setSquad((prev) => [...prev, p]);
  const removePlayer = (userId: string) => setSquad((prev) => prev.filter((p) => p.userId !== userId));

  const submit = async (e: React.FormEvent) => {
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
          totalOvers: sport === "cricket" ? overs : undefined,
          gameLengthMinutes: sport === "football" ? gameLength : undefined,
          players: squad,
        },
      });
      await startFn({ data: { matchId: match.id } });
      toast.success("Match started!");
      navigate({ to: "/scoring/$matchId", params: { matchId: match.id } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not create match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">New match</h2>
        <p className="mt-1 text-sm text-muted-foreground">Only registered Good Bookies players can be added.</p>
      </div>

      <div className="flex gap-2">
        {(["cricket", "football"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSport(s)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              sport === s ? "bg-primary text-primary-foreground" : "bg-[#142219] text-muted-foreground"
            }`}
          >
            {s === "cricket" ? "🏏 Cricket" : "⚽ Football"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Team A name</Label>
          <Input value={teamA} onChange={(e) => setTeamA(e.target.value)} className="mt-1" required />
        </div>
        <div>
          <Label>Team B name</Label>
          <Input value={teamB} onChange={(e) => setTeamB(e.target.value)} className="mt-1" required />
        </div>
      </div>

      {sport === "cricket" ? (
        <div>
          <Label>Overs per innings</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={overs}
            onChange={(e) => setOvers(Number(e.target.value))}
            className="mt-1 max-w-[120px]"
          />
        </div>
      ) : (
        <div>
          <Label>Game length (minutes)</Label>
          <select
            className="mt-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={gameLength}
            onChange={(e) => setGameLength(Number(e.target.value))}
          >
            {FOOTBALL_LENGTHS.map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[#1E3A27] bg-[#142219] p-4">
          <h3 className="font-semibold text-white">{teamA}</h3>
          <PlayerSearch team="a" squad={squad} onAdd={addPlayer} />
        </div>
        <div className="space-y-3 rounded-xl border border-[#1E3A27] bg-[#142219] p-4">
          <h3 className="font-semibold text-white">{teamB}</h3>
          <PlayerSearch team="b" squad={squad} onAdd={addPlayer} />
        </div>
      </div>

      {squad.length > 0 && (
        <ul className="divide-y rounded-xl border border-border/60 bg-card">
          {squad.map((p) => (
            <li key={p.userId} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>
                {p.displayName}
                {p.username ? ` @${p.username}` : ""} · Team {p.team.toUpperCase()}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removePlayer(p.userId)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Create & start scoring"}
      </Button>
    </form>
  );
}

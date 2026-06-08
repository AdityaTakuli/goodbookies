import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { completeScoringMatch, recordFootballGoal } from "@/lib/scoring/scoring.functions";
import type { FootballState, ScoringMatchRow } from "@/lib/scoring/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function FootballScorer({
  match,
  onUpdate,
}: {
  match: ScoringMatchRow;
  onUpdate: (m: ScoringMatchRow) => void;
}) {
  const goalFn = useServerFn(recordFootballGoal);
  const completeFn = useServerFn(completeScoringMatch);
  const [minute, setMinute] = useState(1);
  const [scorerId, setScorerId] = useState(match.players[0]?.userId ?? "");

  const state = match.state as unknown as FootballState;

  const addGoal = async (team: "a" | "b") => {
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
          minute,
        },
      });
      onUpdate(updated);
      if (updated.status === "completed") toast.success("Full time. Match saved!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not record goal");
    }
  };

  const finish = async () => {
    try {
      onUpdate(await completeFn({ data: { matchId: match.id } }));
      toast.success("Match saved to history");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not finish");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1E3A27] bg-[#142219] p-4 text-center sm:p-6">
        <p className="text-xs text-muted-foreground">{state.gameLengthMinutes} min match</p>
        <p className="mt-2 font-display text-4xl font-bold">
          <span className="text-primary">{state.teamAScore}</span>
          <span className="mx-4 text-muted-foreground">–</span>
          <span>{state.teamBScore}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {match.teamAName} vs {match.teamBName} · {state.elapsedMinute}&apos;
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Minute</Label>
          <Input
            type="number"
            min={0}
            max={state.gameLengthMinutes}
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Scorer</Label>
          <select
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={scorerId}
            onChange={(e) => setScorerId(e.target.value)}
          >
            {match.players.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.displayName} ({p.team === "a" ? match.teamAName : match.teamBName})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" onClick={() => addGoal("a")} disabled={match.status !== "live"}>
          Goal: {match.teamAName}
        </Button>
        <Button type="button" onClick={() => addGoal("b")} disabled={match.status !== "live"}>
          Goal: {match.teamBName}
        </Button>
      </div>

      <Button type="button" variant="secondary" onClick={finish} disabled={match.status === "completed"}>
        End match
      </Button>
    </div>
  );
}

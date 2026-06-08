import { useServerFn } from "@tanstack/react-start";
import {
  completeScoringMatch,
  recordCricketBall,
  undoScoringCricketBall,
} from "@/lib/scoring/scoring.functions";
import type { ScoringMatchRow } from "@/lib/scoring/types";
import { CRICKET_BALL_BUTTONS } from "@/lib/scoring/types";
import { cricketOversDisplay } from "@/lib/scoring/cricket-engine";
import type { CricketState } from "@/lib/scoring/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CricketScorer({
  match,
  onUpdate,
}: {
  match: ScoringMatchRow;
  onUpdate: (m: ScoringMatchRow) => void;
}) {
  const ballFn = useServerFn(recordCricketBall);
  const undoFn = useServerFn(undoScoringCricketBall);
  const completeFn = useServerFn(completeScoringMatch);

  const state = match.state as unknown as CricketState;
  const innings = state.innings === 1 ? state.innings1 : state.innings2!;
  const battingTeam = innings.battingTeam === "a" ? match.teamAName : match.teamBName;

  const teamPlayers = match.players.filter((p) => p.team === innings.battingTeam);
  const bowlerPlayers = match.players.filter((p) => p.team !== innings.battingTeam);

  const record = async (outcome: (typeof CRICKET_BALL_BUTTONS)[0]["outcome"]) => {
    try {
      const updated = await ballFn({
        data: {
          matchId: match.id,
          outcome,
          batsmanId: innings.strikerId ?? teamPlayers[0]?.userId,
          bowlerId: innings.bowlerId ?? bowlerPlayers[0]?.userId,
          wicketType: outcome === "wicket" ? "out" : undefined,
        },
      });
      onUpdate(updated);
      if (updated.status === "completed") toast.success("Match completed!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not record ball");
    }
  };

  const undo = async () => {
    try {
      onUpdate(await undoFn({ data: { matchId: match.id } }));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Undo failed");
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
      <div className="rounded-2xl border border-[#1E3A27] bg-[#142219] p-4 sm:p-6">
        <p className="text-xs uppercase tracking-wider text-primary">Innings {state.innings}</p>
        <h2 className="font-display text-2xl font-bold">{battingTeam}</h2>
        <p className="mt-2 font-display text-4xl font-bold text-primary">
          {innings.score}/{innings.wickets}
          <span className="ml-3 text-lg text-muted-foreground">({cricketOversDisplay(innings)} ov)</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {CRICKET_BALL_BUTTONS.map((b) => (
          <Button
            key={b.outcome}
            type="button"
            variant={b.outcome === "wicket" ? "destructive" : "outline"}
            className="h-12 text-sm font-semibold"
            onClick={() => record(b.outcome)}
            disabled={match.status !== "live"}
          >
            {b.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={undo} disabled={match.status !== "live"}>
          Undo last ball
        </Button>
        <Button type="button" onClick={finish} disabled={match.status === "completed"}>
          End match
        </Button>
      </div>
    </div>
  );
}

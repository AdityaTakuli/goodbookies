import { useState } from "react";
import { Lock, ChevronDown } from "lucide-react";
import type { PlayerSportSlug } from "@/lib/sports/player-sports";
import type { MatchHistoryRow, PlayerCardView } from "@/lib/player-card.types";
import { cn } from "@/lib/utils";

type TurfGoal = { venueName: string; goals: number };

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1E3A27] bg-[#0B130E] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function footballDerived(stats: Record<string, number>, matches: MatchHistoryRow[]) {
  const m = stats.matches ?? 0;
  const mins = stats.minutes ?? 0;
  const sportMatches = matches.filter((x) => x.sportSlug === "football");
  const wins = sportMatches.filter((x) => x.playerScore > x.opponentScore).length;
  const winPct = sportMatches.length > 0 ? Math.round((wins / sportMatches.length) * 100) : stats.win_pct ?? 0;
  const avgGame = m > 0 ? Math.round(mins / m) : 0;
  return { winPct, avgGame };
}

function basketballDerived(stats: Record<string, number>, matches: MatchHistoryRow[]) {
  const m = stats.matches ?? 0;
  const sportMatches = matches.filter((x) => x.sportSlug === "basketball");
  const wins = sportMatches.filter((x) => x.playerScore > x.opponentScore).length;
  const winPct = sportMatches.length > 0 ? Math.round((wins / sportMatches.length) * 100) : stats.win_pct ?? 0;
  return {
    ppg: m > 0 ? (stats.points / m).toFixed(1) : "0.0",
    apg: m > 0 ? (stats.assists / m).toFixed(1) : "0.0",
    rpg: m > 0 ? (stats.rebounds / m).toFixed(1) : "0.0",
    stlBlk: `${stats.steals ?? 0} / ${stats.blocks ?? 0}`,
    winPct,
  };
}

export function CardBuilderStatsPanel({
  sport,
  card,
  matches,
  goalsByTurf = [],
}: {
  sport: PlayerSportSlug;
  card: PlayerCardView;
  matches: MatchHistoryRow[];
  goalsByTurf?: TurfGoal[];
}) {
  const [turfOpen, setTurfOpen] = useState(false);
  const s = card.verifiedStats;
  const fb = footballDerived(s, matches);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        {sport === "football" || sport === "cricket"
          ? "Includes turf-verified games and your self-scored matches (this sport only)"
          : "Turf-verified only — updated when venue owners confirm matches"}
      </div>

      {sport === "football" && (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
            <StatCard label="Goals" value={s.goals ?? 0} />
            <StatCard label="Matches" value={s.matches ?? 0} />
            <StatCard label="Position" value={card.position} />
            <StatCard label="Win %" value={`${fb.winPct}%`} hint="from verified scorelines" />
            <StatCard label="Minutes" value={(s.minutes ?? 0).toLocaleString()} hint="total played" />
            <StatCard label="Avg / Game" value={fb.avgGame} hint="minutes" />
          </div>
          <button
            type="button"
            onClick={() => setTurfOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1E3A27] bg-[#0B130E] px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40"
          >
            Goals by turf
            <ChevronDown className={cn("h-4 w-4 transition-transform", turfOpen && "rotate-180")} />
          </button>
          {turfOpen && (
            <div className="rounded-xl border border-[#1E3A27] bg-[#0B130E] p-3">
              {goalsByTurf.length === 0 ? (
                <p className="text-sm text-muted-foreground">No turf breakdown yet</p>
              ) : (
                <ul className="space-y-2">
                  {goalsByTurf.map((t) => (
                    <li key={t.venueName} className="flex justify-between text-sm">
                      <span>{t.venueName}</span>
                      <span className="font-semibold text-primary">{t.goals} goals</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {sport === "cricket" && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
          <StatCard label="Runs" value={s.runs ?? 0} />
          <StatCard label="Wickets" value={s.wickets ?? 0} />
          <StatCard label="Catches" value={s.catches ?? 0} />
          <StatCard label="Boundaries" value={(s.fours ?? 0) + (s.sixes ?? 0)} hint="4s + 6s" />
          <StatCard label="Matches" value={s.matches ?? 0} />
          <StatCard label="Win %" value={`${s.win_pct ?? 0}%`} />
        </div>
      )}

      {sport === "basketball" && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
          {(() => {
            const b = basketballDerived(s, matches);
            return (
              <>
                <StatCard label="PPG" value={b.ppg} />
                <StatCard label="APG" value={b.apg} />
                <StatCard label="RPG" value={b.rpg} />
                <StatCard label="STL / BLK" value={b.stlBlk} />
                <StatCard label="Matches" value={s.matches ?? 0} />
                <StatCard label="Win %" value={`${b.winPct}%`} />
              </>
            );
          })()}
        </div>
      )}

      {sport === "badminton" && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
          <StatCard label="Matches played" value={s.matches ?? 0} />
          <StatCard label="Matches won" value={s.matches_won ?? 0} />
          <StatCard label="Win %" value={`${s.win_pct ?? 0}%`} />
        </div>
      )}
    </div>
  );
}

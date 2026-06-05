import type { MatchHistoryRow } from "@/lib/player-card.types";
import { SPORT_CONFIGS } from "@/lib/sports/player-sports";

export function MatchHistoryList({
  matches,
  sportFilter,
}: {
  matches: MatchHistoryRow[];
  sportFilter?: string;
}) {
  const rows = sportFilter ? matches.filter((m) => m.sportSlug === sportFilter) : matches;
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
        No verified match results yet. Scorelines appear when turf owners confirm your games.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((m) => {
        const sport = SPORT_CONFIGS[m.sportSlug];
        return (
          <div
            key={m.id}
            className="flex flex-col gap-2 rounded-xl border border-border/60 bg-[#142219] px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:gap-x-2 sm:text-sm md:text-base">
              <span className="shrink-0 text-lg">{m.teamIcon ?? sport.icon}</span>
              <span className="truncate font-semibold">You ({m.teamName})</span>
              <span className="font-display text-lg font-bold text-primary sm:text-xl">{m.playerScore}</span>
              <span className="px-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-1 sm:text-xs">vs</span>
              <span className="font-display text-lg font-bold text-foreground/80 sm:text-xl">{m.opponentScore}</span>
              <span className="shrink-0 text-lg">{m.opponentIcon ?? "🔴"}</span>
              <span className="truncate text-muted-foreground">Opponent ({m.opponentName})</span>
            </div>
            <span className="text-xs text-muted-foreground">{m.matchDate}</span>
          </div>
        );
      })}
    </div>
  );
}

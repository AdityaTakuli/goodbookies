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
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-[#142219] px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
              <span className="shrink-0 text-lg">{m.teamIcon ?? sport.icon}</span>
              <span className="truncate font-semibold">You ({m.teamName})</span>
              <span className="font-display text-xl font-bold text-primary">{m.playerScore}</span>
              <span className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">vs</span>
              <span className="font-display text-xl font-bold text-foreground/80">{m.opponentScore}</span>
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

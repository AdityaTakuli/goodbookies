import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyScoringMatches } from "@/lib/scoring/scoring.functions";
import { Button } from "@/components/ui/button";
import { SPORT_CONFIGS } from "@/lib/sports/player-sports";

export const Route = createFileRoute("/scoring/")({
  component: ScoringHome,
});

function ScoringHome() {
  const listFn = useServerFn(listMyScoringMatches);
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["my-scoring-matches"],
    queryFn: () => listFn(),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Score your matches</h2>
        <p className="mt-2 text-sm text-white/70">
          Log in, build teams from registered players, and track cricket ball-by-ball or football goals. Stats
          appear on your player card, separate per sport.
        </p>
        <Link to="/scoring/new" className="mt-4 inline-block">
          <Button className="glow-primary">Start a new match</Button>
        </Link>
      </div>

      <section>
        <h3 className="font-display text-lg font-semibold text-white">Your match history</h3>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && matches.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-[#1E3A27] px-4 py-8 text-center text-sm text-muted-foreground">
            No scored matches yet. Create one to get started.
          </p>
        )}
        <ul className="mt-4 space-y-2">
          {matches.map((m) => {
            const sport = SPORT_CONFIGS[m.sportSlug];
            return (
              <li key={m.id}>
                <Link
                  to="/scoring/$matchId"
                  params={{ matchId: m.id }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1E3A27] bg-[#142219] px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <div>
                    <p className="font-medium text-white">
                      {sport.icon} {m.teamAName} vs {m.teamBName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.matchDate} · {m.status} · {m.players.length} players
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">{m.status}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

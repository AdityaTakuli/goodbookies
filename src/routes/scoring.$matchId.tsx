import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getScoringMatch } from "@/lib/scoring/scoring.functions";
import { CricketScorer } from "@/components/scoring/CricketScorer";
import { FootballScorer } from "@/components/scoring/FootballScorer";
import type { ScoringMatchRow } from "@/lib/scoring/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/scoring/$matchId")({
  component: ScoringMatchPage,
});

function ScoringMatchPage() {
  const { matchId } = Route.useParams();
  const qc = useQueryClient();
  const getFn = useServerFn(getScoringMatch);

  const { data: match, isLoading } = useQuery({
    queryKey: ["scoring-match", matchId],
    queryFn: () => getFn({ data: { matchId } }),
  });

  const onUpdate = (m: ScoringMatchRow) => {
    qc.setQueryData(["scoring-match", matchId], m);
    qc.invalidateQueries({ queryKey: ["my-scoring-matches"] });
  };

  if (isLoading || !match) {
    return <p className="text-muted-foreground">Loading match…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">{match.sportSlug}</p>
          <h2 className="font-display text-2xl font-bold text-white">
            {match.teamAName} vs {match.teamBName}
          </h2>
        </div>
        <Link to="/scoring">
          <Button variant="outline" size="sm">
            ← All matches
          </Button>
        </Link>
      </div>

      {match.status === "completed" && (
        <p className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Match completed — stats saved to each player&apos;s profile (this sport only).
        </p>
      )}

      {match.sportSlug === "cricket" ? (
        <CricketScorer match={match} onUpdate={onUpdate} />
      ) : (
        <FootballScorer match={match} onUpdate={onUpdate} />
      )}
    </div>
  );
}

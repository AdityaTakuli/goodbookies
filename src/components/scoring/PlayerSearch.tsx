import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { searchScoringPlayers } from "@/lib/scoring/scoring.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type SquadPlayer = {
  userId: string;
  team: "a" | "b";
  displayName: string;
  username: string | null;
};

export function PlayerSearch({
  team,
  squad,
  onAdd,
}: {
  team: "a" | "b";
  squad: SquadPlayer[];
  onAdd: (player: SquadPlayer) => void;
}) {
  const searchFn = useServerFn(searchScoringPlayers);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    { id: string; username: string | null; fullName: string; phone: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const rows = await searchFn({ data: { q: q.trim() } });
      setResults(rows);
      if (!rows.length) toast.message("No players found — try username or phone");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const add = (row: (typeof results)[0]) => {
    if (squad.some((p) => p.userId === row.id)) {
      toast.error("Player already in squad");
      return;
    }
    onAdd({
      userId: row.id,
      team,
      displayName: row.fullName,
      username: row.username,
    });
    setResults([]);
    setQ("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search username or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
        />
        <Button type="button" variant="outline" onClick={search} disabled={loading}>
          {loading ? "…" : "Search"}
        </Button>
      </div>
      {results.length > 0 && (
        <ul className="divide-y rounded-xl border border-border/60 bg-card">
          {results.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium truncate">{r.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.username ? `@${r.username}` : "—"}
                  {r.phone ? ` · ${r.phone}` : ""}
                </p>
              </div>
              <Button type="button" size="sm" onClick={() => add(r)}>
                Add
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

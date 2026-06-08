import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/scoring")({
  component: ScoringLayout,
});

function ScoringLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", search: { redirect: "/scoring" } });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-[70vh] bg-[#0B130E]">
      <div className="border-b border-[#1E3A27] bg-[#0B130E]/90">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h1 className="font-display text-lg font-bold text-white sm:text-xl">Match Scoring</h1>
            <span className="hidden rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary sm:inline">
              Free
            </span>
          </div>
          <Link to="/scoring/new" className="text-sm font-medium text-primary hover:underline">
            + New match
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}

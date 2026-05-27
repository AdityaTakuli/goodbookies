import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { getOwnerStatus } from "@/lib/owner.functions";
import { Building2, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/owner")({
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const statusFn = useServerFn(getOwnerStatus);
  const { data: owner } = useQuery({
    queryKey: ["owner-status", user?.id],
    queryFn: () => statusFn(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/owner/login" });
  }, [loading, user, navigate]);

  if (loading || !user) return <div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;

  if (owner?.status !== "approved") {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-muted-foreground">Owner access requires an approved partner account.</p>
        <Link to="/owner/register" className="mt-4 inline-block text-primary hover:underline">Apply to partner</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Owner dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome, {owner.business_name || user.email}. Full venue management (Wave 2b) is coming next.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-lg font-semibold">Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">KPIs, revenue charts, and recent bookings for your venues.</p>
          <p className="mt-3 text-xs text-primary">Coming in Wave 2b</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <Building2 className="h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-lg font-semibold">My venues</h2>
          <p className="mt-1 text-sm text-muted-foreground">CRUD, slots, pricing, and payouts.</p>
          <p className="mt-3 text-xs text-primary">Coming in Wave 2b</p>
        </div>
      </div>
    </div>
  );
}

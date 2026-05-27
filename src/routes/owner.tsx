import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { getOwnerStatus } from "@/lib/owner.functions";
import {
  LayoutDashboard, Building2, Calendar, IndianRupee, BarChart3,
  CreditCard, Settings, Ticket, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner")({
  component: OwnerLayout,
});

const nav = [
  { to: "/owner", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/owner/venues", label: "My Venues", icon: Building2 },
  { to: "/owner/slots", label: "Slots", icon: Calendar },
  { to: "/owner/pricing", label: "Pricing & Offers", icon: IndianRupee },
  { to: "/owner/bookings", label: "Bookings", icon: Ticket },
  { to: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/owner/payouts", label: "Payouts", icon: CreditCard },
  { to: "/owner/settings", label: "Settings", icon: Settings },
];

function OwnerLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const statusFn = useServerFn(getOwnerStatus);
  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: ["owner-status", user?.id],
    queryFn: () => statusFn(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/owner/login" });
  }, [loading, user, navigate]);

  if (loading || ownerLoading || !user) {
    return <div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;
  }

  if (owner?.status !== "approved") {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Partner access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {owner?.status === "pending" && "Your application is under review."}
          {owner?.status === "rejected" && (owner.rejection_reason ?? "Application not approved.")}
          {!owner && "No partner account found."}
        </p>
        <Link to="/owner/register" className="mt-6 text-sm font-medium text-primary hover:underline">Apply to partner</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="rounded-2xl border border-border/60 bg-card p-3">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Partner</p>
          <p className="px-3 pb-2 text-sm font-medium truncate">{owner.business_name || owner.name}</p>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}

import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, CalendarCheck, Building2, Trophy, Users, ShieldAlert, BarChart3, CreditCard, Bell, Settings, UserCheck, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/venues", label: "Venues", icon: Building2 },
  { to: "/admin/sports", label: "Sports", icon: Trophy },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/owner-requests", label: "Owner requests", icon: UserCheck },
  { to: "/admin/venue-approvals", label: "Venue approvals", icon: ClipboardCheck },
  { to: "/admin/owners", label: "Owners", icon: Building2 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", search: { redirect: "/admin" } });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Admin access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account doesn't have permission to view this area.</p>
        <Link to="/" className="mt-6 text-sm font-medium text-primary hover:underline">← Back home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="rounded-2xl border border-border/60 bg-card p-3">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CalendarCheck, User, Bell, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

const nav = [
  { to: "/account", label: "My Bookings", icon: CalendarCheck, exact: true },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/payments", label: "Payment History", icon: CreditCard },
];

function AccountLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", search: { redirect: "/account" } });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;
  }

  if (pathname === "/account/card") {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="rounded-2xl border border-border/60 bg-card p-3">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Account</p>
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

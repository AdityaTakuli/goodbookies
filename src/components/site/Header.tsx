import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const PUBLIC_NAV = [
  { to: "/", label: "Home" },
  { to: "/sports", label: "Sports" },
  { to: "/lobbies", label: "Open Lobbies" },
  { to: "/scoring", label: "Match Scoring" },
] as const;

export function Header() {
  const { user, signOut, isAdmin, isOwner, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the menu; lock page scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const extraNav = [
    ...(user
      ? [
          { to: "/account" as const, label: "My Account" },
          { to: "/account/card" as const, label: "My Player Card" },
        ]
      : []),
    ...(isAdmin ? [{ to: "/admin" as const, label: "Company Dashboard" }] : []),
    ...(isOwner ? [{ to: "/owner" as const, label: "Partner" }] : []),
  ];
  const nav = [...PUBLIC_NAV, ...extraNav];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 font-display text-lg font-bold sm:text-xl"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm text-primary-foreground shadow-[var(--shadow-glow)]">
              GB
            </span>
            <span>Good Bookies</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" || n.to === "/account" }}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                activeProps={{ className: "bg-primary/10 !text-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden h-9 min-w-[11.5rem] items-center justify-end gap-2 lg:flex">
            {loading ? (
              <div className="h-8 w-[10.5rem] animate-pulse rounded-md bg-muted/40" aria-hidden />
            ) : user ? (
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="-mr-2 grid h-11 w-11 place-items-center rounded-lg transition-colors hover:bg-muted/60 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="animate-rise relative max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-border/60 bg-background px-4 pb-6 pt-2 shadow-2xl"
            style={{ animationDuration: "200ms" }}
            aria-label="Mobile"
          >
            <div className="flex flex-col">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.to === "/" || n.to === "/account" }}
                  className="-mx-2 rounded-lg px-2 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  activeProps={{ className: "!text-primary" }}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-3 border-t border-border/60 pt-4">
                {loading ? (
                  <div className="h-11 w-full animate-pulse rounded-md bg-muted/40" aria-hidden />
                ) : user ? (
                  <Button
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                  >
                    Sign out
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="h-11">
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild className="h-11">
                      <Link to="/signup">Get started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

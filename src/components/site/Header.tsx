import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const PUBLIC_NAV = [
  { to: "/", label: "Home" },
  { to: "/sports", label: "Sports" },
  { to: "/lobbies", label: "Open Lobbies" },
  { to: "/scoring", label: "Match Scoring" },
] as const;

export function Header() {
  const { user, signOut, isAdmin, isOwner, loading } = useAuth();
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background md:bg-background/80 md:backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-bold sm:text-xl">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">GB</span>
            <span>Good Bookies</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {[...PUBLIC_NAV, ...extraNav].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden h-9 min-w-[11.5rem] items-center justify-end gap-3 md:flex">
            {loading ? (
              <div className="h-8 w-[10.5rem] rounded-md bg-muted/40" aria-hidden />
            ) : user ? (
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/80"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            className="relative max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border/60 bg-background px-4 py-4 shadow-lg"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-3">
              {[...PUBLIC_NAV, ...extraNav].map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-border/60 pt-3">
                {loading ? (
                  <div className="h-9 w-full rounded-md bg-muted/40" aria-hidden />
                ) : user ? (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setOpen(false); signOut(); }}>
                    Sign out
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Log in</Button>
                    </Link>
                    <Link to="/signup" className="flex-1" onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full">Get started</Button>
                    </Link>
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

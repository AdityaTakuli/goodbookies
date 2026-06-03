import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, signOut, isAdmin, isOwner } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/sports", label: "Sports" },
    { to: "/lobbies", label: "Open Lobbies" },
    ...(user ? [{ to: "/account", label: "My Account" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
    ...(isOwner ? [{ to: "/owner", label: "Partner" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground glow-primary">GB</span>
          <span>Good Bookies</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
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

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
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
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-3 px-4 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" onClick={() => { setOpen(false); signOut(); }}>
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
      )}
    </header>
  );
}
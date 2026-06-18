import { Link } from "@tanstack/react-router";
import { LegalBusinessIdentity } from "@/components/legal/LegalBusinessIdentity";
import { LegalPolicyLinks } from "@/components/legal/LegalPolicyLinks";
import { LEGAL_ENTITY, OWNERS_AND_PARTNERS_DISPLAY } from "@/lib/legal-content";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">GB</span>
            Good Bookies
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Floodlit. Fast. Fully booked. Find and book your next match in seconds.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Book</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/sports" className="transition-colors hover:text-primary">
                Browse all venues
              </Link>
            </li>
            <li>
              <Link to="/sports" search={{ sport: "football" }} className="transition-colors hover:text-primary">
                Football turfs
              </Link>
            </li>
            <li>
              <Link to="/sports" search={{ sport: "cricket" }} className="transition-colors hover:text-primary">
                Cricket nets
              </Link>
            </li>
            <li>
              <Link to="/lobbies" className="transition-colors hover:text-primary">
                Open match lobbies
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">More sports</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/sports" search={{ sport: "basketball" }} className="transition-colors hover:text-primary">
                Basketball
              </Link>
            </li>
            <li>
              <Link to="/sports" search={{ sport: "badminton" }} className="transition-colors hover:text-primary">
                Badminton
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Partner</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/owner/register" className="transition-colors hover:text-primary">
                List your venue
              </Link>
            </li>
            <li>
              <Link to="/owner/login" className="transition-colors hover:text-primary">
                Partner login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Policies</h4>
          <LegalPolicyLinks className="mt-3" />
        </div>
      </div>

      <div className="border-t border-border/60 bg-card/30">
        <div className="container mx-auto grid gap-8 px-4 py-8 md:grid-cols-2">
          <LegalBusinessIdentity />
          <div className="text-sm text-muted-foreground md:text-right">
            <p className="font-semibold text-foreground">{LEGAL_ENTITY.brandName}</p>
            <p className="mt-1">Online sports turf booking platform</p>
            <p className="mt-3 text-xs">
              Payments processed securely via PayU. Prices shown in INR (₹).
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-6">
        <div className="container mx-auto flex justify-center">
          <LegalPolicyLinks inline />
        </div>
        <p className="container mx-auto mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {LEGAL_ENTITY.brandName} · Owners and partners:{" "}
          <span className="font-medium text-foreground">{OWNERS_AND_PARTNERS_DISPLAY}</span>
        </p>
      </div>
    </footer>
  );
}

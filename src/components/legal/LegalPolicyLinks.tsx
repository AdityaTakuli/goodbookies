import { Link } from "@tanstack/react-router";

const POLICY_LINKS = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund", label: "Return & Refund Policy" },
  { to: "/cancellation", label: "Cancellation Policy" },
  { to: "/about", label: "About Us" },
] as const;

type LegalPolicyLinksProps = {
  className?: string;
  inline?: boolean;
};

export function LegalPolicyLinks({ className = "", inline }: LegalPolicyLinksProps) {
  if (inline) {
    return (
      <p className={`flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground ${className}`}>
        {POLICY_LINKS.map((link, i) => (
          <span key={link.to} className="inline-flex items-center gap-3">
            {i > 0 && <span className="text-border" aria-hidden>|</span>}
            <Link to={link.to} className="hover:text-primary hover:underline">
              {link.label}
            </Link>
          </span>
        ))}
      </p>
    );
  }

  return (
    <ul className={`space-y-2 text-sm text-muted-foreground ${className}`}>
      {POLICY_LINKS.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className="transition-colors hover:text-primary">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

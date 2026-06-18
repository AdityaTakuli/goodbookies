import { LEGAL_ENTITY, PARTNERS_DISPLAY } from "@/lib/legal-content";

type LegalBusinessIdentityProps = {
  compact?: boolean;
  className?: string;
};

export function LegalBusinessIdentity({ compact, className = "" }: LegalBusinessIdentityProps) {
  if (compact) {
    return (
      <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
        <span className="font-semibold text-foreground">{LEGAL_ENTITY.legalName}</span>
        {" · "}
        {PARTNERS_DISPLAY}
        {" · "}
        {LEGAL_ENTITY.tradeName}
        {" · "}
        {LEGAL_ENTITY.fullAddress}
      </p>
    );
  }

  return (
    <div className={`space-y-2 text-sm text-muted-foreground ${className}`}>
      <p>
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Legal name
        </span>
        <br />
        <span className="font-semibold text-foreground">{LEGAL_ENTITY.legalName}</span>
      </p>
      <p>
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Partners
        </span>
        <br />
        {PARTNERS_DISPLAY}
      </p>
      <p>
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Trade name
        </span>
        <br />
        {LEGAL_ENTITY.tradeName}
      </p>
      <p>
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Registered &amp; operating address
        </span>
        <br />
        {LEGAL_ENTITY.addressLine1}
        <br />
        {LEGAL_ENTITY.city} – {LEGAL_ENTITY.pincode}
        <br />
        {LEGAL_ENTITY.state}, {LEGAL_ENTITY.country}
      </p>
      <p>
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Contact
        </span>
        <br />
        <a href={`mailto:${LEGAL_ENTITY.email}`} className="text-primary hover:underline">
          {LEGAL_ENTITY.email}
        </a>
        {" · "}
        <a href={`tel:+91${LEGAL_ENTITY.phone}`} className="text-primary hover:underline">
          +91 {LEGAL_ENTITY.phone}
        </a>
      </p>
    </div>
  );
}

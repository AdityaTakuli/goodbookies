import { LEGAL_ENTITY } from "@/lib/legal-content";

type LegalNamesListProps = {
  className?: string;
  inline?: boolean;
};

export function LegalNamesList({ className = "", inline }: LegalNamesListProps) {
  if (inline) {
    return (
      <span className={className}>
        {LEGAL_ENTITY.legalNames.map((name, index) => (
          <span key={name}>
            {name}
            {index < LEGAL_ENTITY.legalNames.length - 1 ? ", " : ""}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={`block ${className}`}>
      {LEGAL_ENTITY.legalNames.map((name, index) => (
        <span key={name} className="block font-medium text-foreground">
          {name}
          {index < LEGAL_ENTITY.legalNames.length - 1 ? "," : ""}
        </span>
      ))}
    </span>
  );
}

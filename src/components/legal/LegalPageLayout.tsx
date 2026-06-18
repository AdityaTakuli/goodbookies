import { Link } from "@tanstack/react-router";
import type { LegalQa } from "@/lib/legal-content";

type LegalPageLayoutProps = {
  title: string;
  intro?: string;
  sections: LegalQa[];
};

export function LegalPageLayout({ title, intro, sections }: LegalPageLayoutProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {intro && <p className="mt-4 text-muted-foreground">{intro}</p>}

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.question} className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <h2 className="text-base font-semibold text-foreground">{section.question}</h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {section.answer}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Last updated: June 2026. For questions, contact{" "}
        <a href="mailto:contact@goodbookies.co.in" className="text-primary hover:underline">
          contact@goodbookies.co.in
        </a>
        .
      </p>
    </div>
  );
}

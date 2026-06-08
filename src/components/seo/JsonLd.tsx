type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Embeds schema.org JSON-LD for crawlers (SSR-safe). */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

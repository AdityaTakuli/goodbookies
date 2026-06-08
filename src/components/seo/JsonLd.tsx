type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Embeds schema.org JSON-LD for crawlers (SSR-safe). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

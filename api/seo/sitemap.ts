import { getSupabaseAdmin } from "../mobile/shared";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const parts = [`  <url>`, `    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      parts.push("  </url>");
      return parts.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function toLastmod(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

export default async function handler(
  _req: unknown,
  res: { setHeader: (key: string, value: string) => void; end: (body: string) => void },
) {
  const base =
    process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "") ||
    process.env.SITE_URL?.replace(/\/$/, "") ||
    "https://goodbookies.co.in";

  const entries: SitemapEntry[] = [
    { loc: `${base}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${base}/sports`, changefreq: "daily", priority: "0.9" },
    { loc: `${base}/lobbies`, changefreq: "hourly", priority: "0.8" },
    { loc: `${base}/owner/register`, changefreq: "monthly", priority: "0.6" },
  ];

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: venues }, { data: sports }] = await Promise.all([
      supabase
        .from("venues")
        .select("slug, updated_at")
        .eq("is_active", true)
        .eq("approval_status", "approved")
        .order("updated_at", { ascending: false }),
      supabase.from("sports").select("slug").eq("is_active", true),
    ]);

    for (const sport of sports ?? []) {
      entries.push({
        loc: `${base}/sports?sport=${encodeURIComponent(sport.slug)}`,
        changefreq: "daily",
        priority: "0.7",
      });
    }

    for (const venue of venues ?? []) {
      entries.push({
        loc: `${base}/venues/${venue.slug}`,
        lastmod: toLastmod(venue.updated_at),
        changefreq: "weekly",
        priority: "0.8",
      });
    }
  } catch (error) {
    console.error("[sitemap]", error);
  }

  res.setHeader("content-type", "application/xml; charset=utf-8");
  res.setHeader("cache-control", "public, max-age=3600, s-maxage=3600");
  res.end(buildSitemapXml(entries));
}

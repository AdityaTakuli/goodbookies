/** Site-wide SEO constants and helpers. */

export const SITE_NAME = "Good Bookies";
export const SITE_TAGLINE = "Book sports turfs online in India";
export const DEFAULT_DESCRIPTION =
  "Find and book floodlit football turfs, cricket nets, basketball courts and more across India. Real-time slot availability, instant confirmation, open match lobbies.";

const DEFAULT_SITE_URL = "https://goodbookies.co.in";

/** Canonical origin — must match on server and client to avoid hydration mismatches. */
export function getSiteUrl(): string {
  if (typeof process !== "undefined") {
    const fromProcess =
      process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "") ||
      process.env.SITE_URL?.replace(/\/$/, "") ||
      process.env.VITE_SITE_URL?.replace(/\/$/, "");
    if (fromProcess) return fromProcess;
  }

  if (typeof window !== "undefined" && window.__GB_PUBLIC_ENV__?.MEDIA_PUBLIC_URL) {
    return window.__GB_PUBLIC_ENV__.MEDIA_PUBLIC_URL.replace(/\/$/, "");
  }

  return DEFAULT_SITE_URL;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Browser tab title — always the brand name. */
export function pageTitle(): string {
  return SITE_NAME;
}

function socialTitle(title: string): string {
  if (title === SITE_NAME || title.endsWith(` | ${SITE_NAME}`)) {
    return title;
  }
  return `${title} | ${SITE_NAME}`;
}

export type PageMetaInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
};

export function buildPageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image,
  imageAlt = SITE_NAME,
  type = "website",
  noIndex = false,
}: PageMetaInput) {
  const tabTitle = pageTitle();
  const shareTitle = socialTitle(title);
  const url = absoluteUrl(path);
  const ogImage = image?.startsWith("http")
    ? image
    : image
      ? absoluteUrl(image)
      : absoluteUrl("/og-image.webp");

  const meta: Array<Record<string, string>> = [
    { title: tabTitle },
    { name: "description", content: description },
    { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: shareTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:locale", content: "en_IN" },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: shareTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  const links: Array<Record<string, string>> = [{ rel: "canonical", href: url }];

  return { meta, links };
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: absoluteUrl("/apple-touch-icon.png"),
    description: DEFAULT_DESCRIPTION,
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/sports?sport={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function sportsActivityVenueJsonLd(venue: {
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  city: string;
  price_per_hour: number;
  rating?: number | null;
  review_count?: number | null;
  image_url?: string | null;
  sport?: { name: string } | null;
}) {
  const url = absoluteUrl(`/venues/${venue.slug}`);
  const entry: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: venue.name,
    url,
    description: venue.description || `${venue.name}, ${venue.sport?.name ?? "Sports"} turf in ${venue.city}. Book online on ${SITE_NAME}.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressCountry: "IN",
    },
    priceRange: `₹${venue.price_per_hour}`,
  };

  if (venue.rating != null && venue.rating > 0) {
    entry.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(venue.rating).toFixed(1),
      reviewCount: Math.max(1, Number(venue.review_count ?? 1)),
    };
  }

  if (venue.image_url) {
    entry.image = venue.image_url.startsWith("http") ? venue.image_url : absoluteUrl(venue.image_url);
  }

  return entry;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

import { resolveMediaUrlAbsolute } from "@/lib/media/urls";

export type VenueMediaItem = {
  type: "image" | "video";
  url: string;
  label?: string;
};

export function parseVenueMediaGallery(raw: unknown): VenueMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const type = row.type === "video" ? "video" : row.type === "image" ? "image" : null;
      const url = typeof row.url === "string" ? row.url.trim() : "";
      if (!type || !url) return null;
      return {
        type,
        url,
        label: typeof row.label === "string" ? row.label : undefined,
      };
    })
    .filter(Boolean) as VenueMediaItem[];
}

export function resolveVenueGalleryItems(
  gallery: unknown,
  fallbackImageUrl?: string | null,
): VenueMediaItem[] {
  const items = parseVenueMediaGallery(gallery);
  if (items.length > 0) return items;
  if (fallbackImageUrl) return [{ type: "image", url: fallbackImageUrl }];
  return [];
}

/** Client-safe absolute URL for img/video src. */
export function venueMediaSrc(url: string, siteOrigin = "https://goodbookies.co.in") {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/api/media/") || url.startsWith("/uploads/") || url.startsWith("/venues/")) {
    const base =
      typeof window !== "undefined" ? window.location.origin : siteOrigin.replace(/\/$/, "");
    return `${base}${url}`;
  }
  return resolveMediaUrlAbsolute(url);
}

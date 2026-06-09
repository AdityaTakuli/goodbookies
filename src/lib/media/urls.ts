import football from "@/assets/venue-football.jpg";
import cricket from "@/assets/venue-cricket.jpg";
import basketball from "@/assets/venue-basketball.jpg";

const LEGACY_VENUE_KEYS: Record<string, string> = {
  "venue-football": football,
  "venue-cricket": cricket,
  "venue-basketball": basketball,
};

/** Resolve a stored media key/path/URL for use in img src. */
export function resolveMediaUrl(key?: string | null, fallback = football): string {
  if (!key) return fallback;
  if (key.startsWith("data:")) return key;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/api/media/user/")) return key;
  if (key.startsWith("/api/media/venue/")) return key;
  if (key.startsWith("/api/media/asset/")) return key;
  if (key.startsWith("/uploads/")) return key;
  if (key.startsWith("/venues/")) return key;
  return LEGACY_VENUE_KEYS[key] ?? fallback;
}

export function resolveVenueImage(key?: string | null): string {
  return resolveMediaUrl(key, football);
}

/** Server/mobile: prepend public site origin for relative upload paths. */
export function resolveMediaUrlAbsolute(key?: string | null, fallback?: string): string {
  if (!key) return fallback ?? football;
  if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("data:")) {
    return key;
  }
  if (
    key.startsWith("/uploads/") ||
    key.startsWith("/venues/") ||
    key.startsWith("/api/media/user/") ||
    key.startsWith("/api/media/venue/") ||
    key.startsWith("/api/media/asset/")
  ) {
    const base =
      (typeof process !== "undefined" && process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "")) ||
      "https://goodbookies.co.in";
    return `${base}${key}`;
  }
  return resolveMediaUrl(key, fallback);
}

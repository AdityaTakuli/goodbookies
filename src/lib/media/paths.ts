/** Stored media reference in Supabase (profile avatar_url, venue image_url, etc.) */
export function isStoredMediaPath(value: string): boolean {
  return (
    value.startsWith("/uploads/") ||
    value.startsWith("/api/media/user/") ||
    value.startsWith("/api/media/venue/") ||
    value.startsWith("/api/media/asset/")
  );
}

export function isAllowedImageReference(value: string): boolean {
  return (
    isStoredMediaPath(value) ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("venue-")
  );
}

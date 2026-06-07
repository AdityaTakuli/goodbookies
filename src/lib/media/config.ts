export const MEDIA_CATEGORIES = ["avatars", "venues", "videos"] as const;
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export type MediaCategoryConfig = {
  maxBytes: number;
  mimeTypes: readonly string[];
  label: string;
};

export const MEDIA_CATEGORY_CONFIG: Record<MediaCategory, MediaCategoryConfig> = {
  avatars: {
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    label: "Profile photo",
  },
  venues: {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    label: "Venue photo",
  },
  videos: {
    maxBytes: 50 * 1024 * 1024,
    mimeTypes: ["video/mp4", "video/webm"],
    label: "Video",
  },
};

export function isMediaCategory(value: string): value is MediaCategory {
  return (MEDIA_CATEGORIES as readonly string[]).includes(value);
}

export function acceptAttrForCategory(category: MediaCategory): string {
  return MEDIA_CATEGORY_CONFIG[category].mimeTypes.join(",");
}
